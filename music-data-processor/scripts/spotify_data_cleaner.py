#!/usr/bin/env python3
"""
Spotify Streaming History Data Cleaner

This script processes Spotify extended streaming history data with the following rules:
1. Only include songs (exclude podcasts, videos, audiobooks)
2. Exclude incognito_mode and skipped songs played less than 30 seconds
3. Add a "provider" field with value "Spotify"

Usage: python spotify_data_cleaner.py <folder_path>
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict


def is_song(record: Dict[str, Any]) -> bool:
    """
    Determine if a record is a song (not podcast, video, or audiobook).
    
    A record is considered a song if:
    - It has a spotify_track_uri (not null)
    - It has track metadata (track_name, artist_name, album_name not null)
    - It doesn't have episode or audiobook metadata
    """
    # Check if it's a song by having track URI and metadata
    has_track_uri = record.get('spotify_track_uri') is not None
    has_track_name = record.get('master_metadata_track_name') is not None
    has_artist_name = record.get('master_metadata_album_artist_name') is not None
    
    # Check if it's NOT a podcast/video/audiobook
    is_not_episode = record.get('episode_name') is None and record.get('spotify_episode_uri') is None
    is_not_audiobook = record.get('audiobook_title') is None and record.get('audiobook_uri') is None
    
    return has_track_uri and has_track_name and has_artist_name and is_not_episode and is_not_audiobook


def should_exclude_record(record: Dict[str, Any]) -> bool:
    """
    Determine if a record should be excluded based on the filtering rules.
    
    Exclude if:
    - incognito_mode is True
    - skipped is True AND ms_played < 30000 (30 seconds)
    - timestamp is before 2016-01-01
    """
    is_incognito = record.get('incognito_mode', False)
    is_skipped = record.get('skipped', False)
    ms_played = record.get('ms_played', 0)
    
    # Exclude incognito mode
    if is_incognito:
        return True
    
    # Exclude skipped songs with less than 30 seconds play time
    if is_skipped and ms_played < 30000:
        return True
    
    # Exclude data before 2016-01-01
    timestamp = record.get('ts', '')
    if timestamp and is_before_2016(timestamp):
        return True
    
    return False


def is_before_2016(timestamp: str) -> bool:
    """
    Check if a timestamp is before 2016-01-01.
    
    Args:
        timestamp: ISO format timestamp string
        
    Returns:
        True if timestamp is before 2016-01-01, False otherwise
    """
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return dt.year < 2016
    except (ValueError, AttributeError):
        return False


def is_suspicious_stream(record: Dict[str, Any]) -> bool:
    """
    Detect potentially suspicious or fraudulent streaming data.
    
    Suspicious indicators:
    - IP address patterns (like VPN/proxy ranges)
    - Country code "ZZ" (invalid country)
    - Unusual connection patterns
    - Known fake artists/albums
    
    Args:
        record: Spotify streaming record
        
    Returns:
        True if record appears suspicious, False otherwise
    """
    # Check for invalid country code
    country = record.get('conn_country', '')
    if country == 'ZZ':
        return True
    
    # Check for suspicious IP patterns
    ip_addr = record.get('ip_addr', '')
    if ip_addr and is_suspicious_ip(ip_addr):
        return True
    
    # Check for known fake artists/albums
    artist = record.get('master_metadata_album_artist_name', '')
    album = record.get('master_metadata_album_album_name', '')
    if is_fake_artist_or_album(artist, album):
        return True
    
    return False


def is_suspicious_ip(ip_addr: str) -> bool:
    """
    Check if an IP address appears suspicious.
    
    Args:
        ip_addr: IP address string
        
    Returns:
        True if IP appears suspicious, False otherwise
    """
    # Known suspicious IP ranges or patterns
    suspicious_ips = [
        '173.249.43.234',  # Specific IP found in the Wakeem data
    ]
    
    # Check for exact matches
    if ip_addr in suspicious_ips:
        return True
    
    # Check for ranges that might be VPN/proxy services
    # This is a simplified check - in production you'd want more sophisticated IP analysis
    suspicious_ranges = [
        '173.249.43.',  # Range that includes the suspicious IP
    ]
    
    for range_prefix in suspicious_ranges:
        if ip_addr.startswith(range_prefix):
            return True
    
    return False


def is_fake_artist_or_album(artist: str, album: str) -> bool:
    """
    Check if an artist or album appears to be fake/spam.
    
    Args:
        artist: Artist name
        album: Album name
        
    Returns:
        True if appears fake, False otherwise
    """
    # Known fake artists/albums
    fake_artists = [
        'Wakeem',  # Specific fake artist found in the data
    ]
    
    fake_albums = [
        'War for Honor',  # Specific fake album
        'War of Honor',   # Possible variation
    ]
    
    if artist and artist in fake_artists:
        return True
    
    if album and album in fake_albums:
        return True
    
    return False


def detect_streaming_anomalies(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect and remove streaming anomalies using pattern analysis.
    
    This function looks for patterns that might indicate fake streams:
    - Too many plays in a short time period
    - Identical metadata repeated excessively
    - Suspicious timing patterns
    
    Args:
        records: List of streaming records
        
    Returns:
        List of records with anomalies removed
    """
    if not records:
        return records
    
    # Group records by artist and track for analysis
    track_groups = defaultdict(list)
    
    for record in records:
        artist = record.get('master_metadata_album_artist_name', '')
        track = record.get('master_metadata_track_name', '')
        if artist and track:
            key = f"{artist}|||{track}"
            track_groups[key].append(record)
    
    # Analyze each track group for anomalies
    anomalous_records = set()
    
    for key, group_records in track_groups.items():
        if len(group_records) > 100:  # Threshold for suspicion
            # Check for rapid succession plays
            group_records.sort(key=lambda x: x.get('ts', ''))
            
            rapid_plays = 0
            for i in range(1, len(group_records)):
                prev_time = group_records[i-1].get('ts', '')
                curr_time = group_records[i].get('ts', '')
                
                if prev_time and curr_time:
                    try:
                        prev_dt = datetime.fromisoformat(prev_time.replace('Z', '+00:00'))
                        curr_dt = datetime.fromisoformat(curr_time.replace('Z', '+00:00'))
                        
                        # If plays are less than 30 seconds apart, it's suspicious
                        if (curr_dt - prev_dt).total_seconds() < 30:
                            rapid_plays += 1
                    except (ValueError, AttributeError):
                        continue
            
            # If more than 50% of plays are rapid succession, mark as anomalous
            if rapid_plays > len(group_records) * 0.5:
                for record in group_records:
                    anomalous_records.add(id(record))
    
    # Filter out anomalous records
    clean_records = [record for record in records if id(record) not in anomalous_records]
    
    removed_count = len(records) - len(clean_records)
    if removed_count > 0:
        print(f"  Removed {removed_count} records due to streaming anomalies")
    
    return clean_records


def process_streaming_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Process a single streaming history JSON file.
    
    Returns a list of cleaned records.
    """
    print(f"Processing file: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except (json.JSONDecodeError, FileNotFoundError, UnicodeDecodeError) as e:
        print(f"Error reading file {file_path}: {e}")
        return []
    
    if not isinstance(data, list):
        print(f"Warning: Expected list in {file_path}, got {type(data)}")
        return []
    
    cleaned_records = []
    total_records = len(data)
    songs_count = 0
    excluded_count = 0
    suspicious_count = 0
    pre_2016_count = 0
    
    for record in data:
        # Check if it's a song
        if not is_song(record):
            continue
        
        songs_count += 1
        
        # Check if should be excluded due to standard rules
        if should_exclude_record(record):
            excluded_count += 1
            # Count pre-2016 exclusions separately
            if record.get('ts', '') and is_before_2016(record.get('ts', '')):
                pre_2016_count += 1
            continue
        
        # Check if record appears suspicious
        if is_suspicious_stream(record):
            suspicious_count += 1
            continue
        
        # Add provider field and include the record
        record['provider'] = 'Spotify'
        cleaned_records.append(record)
    
    # Apply anomaly detection
    cleaned_records = detect_streaming_anomalies(cleaned_records)
    
    print(f"  Total records: {total_records}")
    print(f"  Song records: {songs_count}")
    print(f"  Excluded records: {excluded_count}")
    print(f"  - Pre-2016 exclusions: {pre_2016_count}")
    print(f"  Suspicious records: {suspicious_count}")
    print(f"  Final cleaned records: {len(cleaned_records)}")
    
    return cleaned_records


def process_spotify_data(json_files: List[str], output_file: str) -> None:
    """
    Main function to process Spotify streaming history data.
    
    Processes all JSON files and outputs a cleaned file.
    """
    print(f"Processing {len(json_files)} Spotify JSON files...")
    
    # Process all files
    all_cleaned_records = []
    for file_path in json_files:
        cleaned_records = process_streaming_file(file_path)
        all_cleaned_records.extend(cleaned_records)
    
    # Sort by timestamp for consistency
    all_cleaned_records.sort(key=lambda x: x.get('ts', ''))
    
    # Write cleaned data
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(all_cleaned_records, file, indent=2, ensure_ascii=False)
        
        print(f"\nSpotify data cleaning complete!")
        print(f"Total cleaned records: {len(all_cleaned_records)}")
        print(f"Output file: {output_file}")
        
    except Exception as e:
        print(f"Error writing output file: {e}")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python spotify_data_cleaner.py <json_file1> [json_file2] ...")
        print("Example: python spotify_data_cleaner.py 'endsong_0.json' 'endsong_1.json'")
        sys.exit(1)
    
    # Use relative paths from project root
    base_dir = Path(__file__).parent.parent
    output_file = base_dir / 'output' / 'spotify_full_streaming_data_clean.json'
    
    # Get input files from command line
    json_files = sys.argv[1:]
    
    # Check if files exist
    for file_path in json_files:
        if not Path(file_path).exists():
            print(f"Error: File '{file_path}' not found.")
            sys.exit(1)
    
    process_spotify_data(json_files, str(output_file))


if __name__ == "__main__":
    main()
