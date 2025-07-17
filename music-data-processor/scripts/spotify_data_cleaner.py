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
    
    return False


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
    
    for record in data:
        # Check if it's a song
        if not is_song(record):
            continue
        
        songs_count += 1
        
        # Check if should be excluded
        if should_exclude_record(record):
            excluded_count += 1
            continue
        
        # Add provider field and include the record
        record['provider'] = 'Spotify'
        cleaned_records.append(record)
    
    print(f"  Total records: {total_records}")
    print(f"  Song records: {songs_count}")
    print(f"  Excluded records: {excluded_count}")
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
