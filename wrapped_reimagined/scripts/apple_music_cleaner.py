#!/usr/bin/env python3
"""
Apple Music Streaming History Data Cleaner

This script processes Apple Music streaming history CSV data and converts it to match
the Spotify JSON format with the following features:
1. Parse track description into artist and song name
2. Map fields to Spotify JSON format with provider = "Apple Music"
3. Perform fuzzy matching on artist names against Spotify data
4. Output cleaned data and mapping summary

Usage: python apple_music_cleaner.py <csv_file_path> <spotify_json_path>
"""

import csv
import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from difflib import SequenceMatcher
from datetime import datetime
import re


def load_spotify_artists(spotify_file_path: str) -> List[str]:
    """Load unique artist names from Spotify data for fuzzy matching."""
    print(f"Loading Spotify artists from: {spotify_file_path}")
    
    try:
        with open(spotify_file_path, 'r', encoding='utf-8') as file:
            spotify_data = json.load(file)
    except Exception as e:
        print(f"Error loading Spotify data: {e}")
        return []
    
    artists = set()
    for record in spotify_data:
        artist = record.get('master_metadata_album_artist_name')
        if artist:
            artists.add(artist)
    
    artist_list = sorted(list(artists))
    print(f"Loaded {len(artist_list)} unique artists from Spotify data")
    return artist_list


def similarity(a: str, b: str) -> float:
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def fuzzy_match_artist(apple_artist: str, spotify_artists: List[str], threshold: float = 0.8) -> Tuple[str, float]:
    """
    Find the best matching Spotify artist using fuzzy matching.
    
    Returns (matched_artist, similarity_score)
    """
    if not apple_artist or not spotify_artists:
        return apple_artist, 0.0
    
    best_match = apple_artist
    best_score = 0.0
    
    for spotify_artist in spotify_artists:
        score = similarity(apple_artist, spotify_artist)
        if score > best_score:
            best_score = score
            best_match = spotify_artist
    
    # Only return the match if it meets the threshold
    if best_score >= threshold:
        return best_match, best_score
    else:
        return apple_artist, best_score


def parse_track_description(track_description: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Parse track description into artist and song name.
    
    Expected format: "Artist - Song Title"
    Returns (artist, song_name)
    """
    if not track_description:
        return None, None
    
    # Handle cases where track description might be just a number or invalid
    if track_description.isdigit():
        return None, None
    
    # Look for the pattern "Artist - Song"
    # Use a more robust splitting approach
    if ' - ' in track_description:
        parts = track_description.split(' - ', 1)  # Split only on first occurrence
        if len(parts) == 2:
            artist = parts[0].strip()
            song = parts[1].strip()
            return artist, song
    
    # If no dash found, treat entire string as song name with unknown artist
    return None, track_description.strip()


def convert_timestamp(date_played: str, hours: str) -> str:
    """
    Convert Apple Music date and hour to ISO timestamp.
    
    date_played: YYYYMMDD format
    hours: hour of day (can be comma-separated for multiple hours)
    """
    try:
        # Handle cases where hours might be "16, 18" - use first hour
        hour_str = hours.split(',')[0].strip() if ',' in hours else hours.strip()
        hour = int(hour_str)
        
        # Parse date
        year = int(date_played[:4])
        month = int(date_played[4:6])
        day = int(date_played[6:8])
        
        # Create timestamp
        dt = datetime(year, month, day, hour, 0, 0)
        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    except (ValueError, IndexError):
        # Fallback to just date if hour parsing fails
        try:
            year = int(date_played[:4])
            month = int(date_played[4:6])
            day = int(date_played[6:8])
            dt = datetime(year, month, day, 0, 0, 0)
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        except:
            return "1970-01-01T00:00:00Z"


def map_end_reason(end_reason: str) -> str:
    """Map Apple Music end reason to Spotify format."""
    mapping = {
        "NATURAL_END_OF_TRACK": "trackdone",
        "MANUALLY_SELECTED_PLAYBACK_OF_A_DIFF_ITEM": "fwdbtn",
        "PLAYBACK_MANUALLY_PAUSED": "endplay",
        "SCRUBBING_BEGIN": "fwdbtn",
        "SCRUBBING_END": "endplay"
    }
    return mapping.get(end_reason, "unknown")


def map_platform(source_type: str) -> str:
    """Map Apple Music source type to platform format."""
    mapping = {
        "IPHONE": "iOS",
        "IPAD": "iOS",
        "MACOS": "macOS",
        "ITUNES": "Windows",
        "APPLE_TV": "tvOS",
        "APPLE_WATCH": "watchOS"
    }
    return mapping.get(source_type, source_type)


def map_country(country: str) -> str:
    """Map country name to country code."""
    mapping = {
        "United States": "US",
        "Canada": "CA",
        "United Kingdom": "GB",
        "Australia": "AU",
        "Germany": "DE",
        "France": "FR",
        "Japan": "JP",
        "Brazil": "BR",
        "Mexico": "MX",
        "Italy": "IT",
        "Spain": "ES",
        "Netherlands": "NL",
        "Sweden": "SE",
        "Norway": "NO",
        "Denmark": "DK",
        "Finland": "FI"
    }
    return mapping.get(country, country)


def should_exclude_record(row: Dict[str, Any]) -> bool:
    """
    Determine if a record should be excluded.
    
    Exclude if:
    - Media type is not AUDIO
    - Play duration is less than 30 seconds (30000ms)
    - Track description cannot be parsed
    """
    # Check media type
    media_type = row.get('Media type', '')
    if media_type != 'AUDIO':
        return True
    
    # Check play duration (30 second minimum)
    try:
        play_duration = int(row.get('Play Duration Milliseconds', 0))
        if play_duration < 30000:
            return True
    except (ValueError, TypeError):
        return True
    
    # Check if track description can be parsed
    track_description = row.get('Track Description', '')
    artist, song = parse_track_description(track_description)
    if not song:  # If we can't extract at least a song name, exclude
        return True
    
    return False


def convert_apple_music_record_optimized(row: Dict[str, Any], spotify_artists: List[str], 
                                       spotify_artists_set: set, top_apple_artists: List[str]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Convert a single Apple Music record to Spotify format with optimized fuzzy matching.
    
    Only apply fuzzy matching to top artists by play count.
    For other artists, do exact matching first, then keep original name.
    
    Returns (converted_record, mapping_info)
    """
    # Parse track description
    track_description = row.get('Track Description', '')
    artist, song = parse_track_description(track_description)
    
    # Perform optimized artist matching
    mapping_info = {}
    if artist:
        # First, check for exact match in Spotify artists (fast lookup)
        if artist in spotify_artists_set:
            matched_artist = artist
            similarity_score = 1.0
            was_matched = True
        # If not exact match and artist is in top artists, apply fuzzy matching
        elif artist in top_apple_artists:
            matched_artist, similarity_score = fuzzy_match_artist(artist, spotify_artists)
            was_matched = similarity_score >= 0.8
        else:
            # For non-top artists, keep original name without fuzzy matching
            matched_artist = artist
            similarity_score = 0.0
            was_matched = False
        
        mapping_info = {
            'original_artist': artist,
            'matched_artist': matched_artist,
            'similarity_score': similarity_score,
            'was_matched': was_matched
        }
        final_artist = matched_artist
    else:
        final_artist = None
        mapping_info = {
            'original_artist': None,
            'matched_artist': None,
            'similarity_score': 0.0,
            'was_matched': False
        }
    
    # Convert timestamp
    timestamp = convert_timestamp(
        row.get('Date Played', ''),
        row.get('Hours', '')
    )
    
    # Create Spotify-format record
    converted_record = {
        'ts': timestamp,
        'platform': map_platform(row.get('Source Type', '')),
        'ms_played': int(row.get('Play Duration Milliseconds', 0)),
        'conn_country': map_country(row.get('Country', '')),
        'ip_addr': None,
        'master_metadata_track_name': song,
        'master_metadata_album_artist_name': final_artist,
        'master_metadata_album_album_name': None,
        'spotify_track_uri': None,
        'episode_name': None,
        'episode_show_name': None,
        'spotify_episode_uri': None,
        'audiobook_title': None,
        'audiobook_uri': None,
        'audiobook_chapter_uri': None,
        'audiobook_chapter_title': None,
        'reason_start': 'unknown',
        'reason_end': map_end_reason(row.get('End Reason Type', '')),
        'shuffle': None,
        'skipped': int(row.get('Skip Count', 0)) > 0,
        'offline': None,
        'offline_timestamp': None,
        'incognito_mode': False,
        'provider': 'Apple Music'
    }
    
    return converted_record, mapping_info


def get_top_artists_by_play_count(csv_path: str, top_n: int = 50) -> List[str]:
    """
    Get top N artists by play count from Apple Music CSV.
    
    Returns list of artist names sorted by play count (descending).
    """
    print(f"Analyzing Apple Music CSV to find top {top_n} artists by play count...")
    
    artist_play_counts = {}
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Skip excluded records
                if should_exclude_record(row):
                    continue
                
                # Parse artist from track description
                track_description = row.get('Track Description', '')
                artist, song = parse_track_description(track_description)
                
                if artist:
                    play_duration = int(row.get('Play Duration Milliseconds', 0))
                    artist_play_counts[artist] = artist_play_counts.get(artist, 0) + play_duration
    
    except Exception as e:
        print(f"Error analyzing CSV file: {e}")
        return []
    
    # Sort by play count and get top N
    sorted_artists = sorted(artist_play_counts.items(), key=lambda x: x[1], reverse=True)
    top_artists = [artist for artist, count in sorted_artists[:top_n]]
    
    print(f"Found {len(top_artists)} top artists for fuzzy matching")
    if top_artists:
        print("Top 10 artists by play time:")
        for i, (artist, count) in enumerate(sorted_artists[:10]):
            print(f"  {i+1}. {artist}: {count/1000/60:.1f} minutes")
    
    return top_artists


def process_apple_music_csv(csv_path: str, spotify_json_path: str, output_file: str) -> None:
    """
    Main function to process Apple Music CSV and convert to Spotify JSON format.
    """
    print(f"Processing Apple Music CSV: {csv_path}")
    
    # Load Spotify artists for fuzzy matching
    spotify_artists = load_spotify_artists(spotify_json_path)
    
    # Get top 50 artists by play count for fuzzy matching
    top_apple_artists = get_top_artists_by_play_count(csv_path, 50)
    
    # Create a set of Spotify artists for fast lookup
    spotify_artists_set = set(spotify_artists)
    
    # Process Apple Music CSV
    converted_records = []
    mapping_summary = []
    
    total_records = 0
    excluded_records = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                total_records += 1
                
                # Check if record should be excluded
                if should_exclude_record(row):
                    excluded_records += 1
                    continue
                
                # Convert record with optimized fuzzy matching
                converted_record, mapping_info = convert_apple_music_record_optimized(
                    row, spotify_artists, spotify_artists_set, top_apple_artists
                )
                converted_records.append(converted_record)
                
                # Store mapping info if artist was involved
                if mapping_info['original_artist']:
                    mapping_summary.append(mapping_info)
    
    except Exception as e:
        print(f"Error processing CSV file: {e}")
        return
    
    # Sort records by timestamp
    converted_records.sort(key=lambda x: x.get('ts', ''))
    
    # Output paths
    output_dir = Path(output_file).parent
    mapping_file = output_dir / 'apple_music_artist_mapping_summary.json'
    
    # Write converted data
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(converted_records, file, indent=2, ensure_ascii=False)
        
        print(f"\nApple Music conversion complete!")
        print(f"Total records processed: {total_records}")
        print(f"Excluded records: {excluded_records}")
        print(f"Final converted records: {len(converted_records)}")
        print(f"Output file: {output_file}")
    
    except Exception as e:
        print(f"Error writing output file: {e}")
        return
    
    # Create mapping summary
    if mapping_summary:
        # Group by original artist for summary
        artist_mappings = {}
        for mapping in mapping_summary:
            original = mapping['original_artist']
            if original not in artist_mappings:
                artist_mappings[original] = {
                    'original_artist': original,
                    'matched_artist': mapping['matched_artist'],
                    'similarity_score': mapping['similarity_score'],
                    'was_matched': mapping['was_matched'],
                    'occurrence_count': 1
                }
            else:
                artist_mappings[original]['occurrence_count'] += 1
        
        # Convert to list and sort
        summary_list = sorted(artist_mappings.values(), key=lambda x: x['occurrence_count'], reverse=True)
        
        # Write mapping summary
        try:
            with open(mapping_file, 'w', encoding='utf-8') as file:
                json.dump(summary_list, file, indent=2, ensure_ascii=False)
            
            print(f"Mapping summary file: {mapping_file}")
            
            # Print some statistics
            matched_count = sum(1 for m in summary_list if m['was_matched'])
            total_unique_artists = len(summary_list)
            
            print(f"\nArtist Mapping Statistics:")
            print(f"Total unique artists: {total_unique_artists}")
            print(f"Successfully matched: {matched_count} ({matched_count/total_unique_artists*100:.1f}%)")
            print(f"No match found: {total_unique_artists - matched_count}")
            
            # Show top 10 mappings
            print(f"\nTop 10 Artist Mappings:")
            for mapping in summary_list[:10]:
                status = "✓" if mapping['was_matched'] else "✗"
                print(f"  {status} '{mapping['original_artist']}' → '{mapping['matched_artist']}' (similarity: {mapping['similarity_score']:.3f}, count: {mapping['occurrence_count']})")
        
        except Exception as e:
            print(f"Error writing mapping summary: {e}")


def main():
    """Main entry point."""
    if len(sys.argv) != 3:
        print("Usage: python apple_music_cleaner.py <csv_file_path> <spotify_json_path>")
        print("Example: python apple_music_cleaner.py 'Apple Music - Play History Daily Tracks.csv' 'spotify_full_streaming_data_clean.json'")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    spotify_json_path = sys.argv[2]
    
    # Check if files exist
    if not Path(csv_path).exists():
        print(f"Error: CSV file '{csv_path}' not found.")
        sys.exit(1)
    
    if not Path(spotify_json_path).exists():
        print(f"Error: Spotify JSON file '{spotify_json_path}' not found.")
        sys.exit(1)
    
    # Use relative paths from project root
    base_dir = Path(__file__).parent.parent
    output_file = base_dir / 'output' / 'apple_music_full_streaming_data_clean.json'
    
    process_apple_music_csv(csv_path, spotify_json_path, str(output_file))


if __name__ == "__main__":
    main()
