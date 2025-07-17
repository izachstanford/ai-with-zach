#!/usr/bin/env python3
"""
Streaming Data Consolidator

This script concatenates Spotify and Apple Music streaming data files into a single
consolidated JSON file with the following features:
1. Load both JSON files
2. Combine all records into a single list
3. Sort by timestamp for chronological order
4. Output consolidated data with summary statistics

Usage: python consolidate_streaming_data.py
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime


def load_json_file(file_path: str) -> List[Dict[str, Any]]:
    """Load JSON file and return the data."""
    print(f"Loading: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        print(f"  Loaded {len(data)} records")
        return data
    except Exception as e:
        print(f"  Error loading file: {e}")
        return []


def parse_timestamp(ts_str: str) -> datetime:
    """Parse timestamp string to datetime object for sorting."""
    try:
        # Handle both formats: "2023-01-01T12:00:00Z" and "2023-01-01T12:00:00.000Z"
        if ts_str.endswith('Z'):
            if '.' in ts_str:
                return datetime.strptime(ts_str, '%Y-%m-%dT%H:%M:%S.%fZ')
            else:
                return datetime.strptime(ts_str, '%Y-%m-%dT%H:%M:%SZ')
        else:
            return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
    except Exception:
        # Fallback for invalid timestamps
        return datetime.min


def get_date_range(records: List[Dict[str, Any]]) -> tuple:
    """Get the date range (earliest and latest) from records."""
    if not records:
        return None, None
    
    timestamps = []
    for record in records:
        ts = record.get('ts')
        if ts:
            try:
                timestamps.append(parse_timestamp(ts))
            except:
                continue
    
    if not timestamps:
        return None, None
    
    return min(timestamps), max(timestamps)


def analyze_providers(records: List[Dict[str, Any]]) -> Dict[str, int]:
    """Analyze provider distribution in the records."""
    provider_counts = {}
    
    for record in records:
        provider = record.get('provider', 'Unknown')
        provider_counts[provider] = provider_counts.get(provider, 0) + 1
    
    return provider_counts


def consolidate_streaming_data() -> None:
    """Main function to consolidate streaming data files."""
    # File paths
    spotify_file = '/Users/zachstanford/Documents/Raw Streaming Data/Spotify Extended Streaming History/spotify_full_streaming_data_clean.json'
    apple_file = '/Users/zachstanford/Documents/Raw Streaming Data/apple_music_full_streaming_data_clean.json'
    output_file = '/Users/zachstanford/Documents/Raw Streaming Data/consolidated_full_streaming_data_clean.json'
    
    print("=== Streaming Data Consolidation ===\n")
    
    # Load both files
    spotify_data = load_json_file(spotify_file)
    apple_data = load_json_file(apple_file)
    
    # Check if files were loaded successfully
    if not spotify_data and not apple_data:
        print("Error: No data loaded from either file!")
        return
    
    # Combine all records
    all_records = spotify_data + apple_data
    total_records = len(all_records)
    
    print(f"\nCombining data:")
    print(f"  Spotify records: {len(spotify_data)}")
    print(f"  Apple Music records: {len(apple_data)}")
    print(f"  Total combined records: {total_records}")
    
    # Sort by timestamp for chronological order
    print("\nSorting records by timestamp...")
    all_records.sort(key=lambda x: parse_timestamp(x.get('ts', '')))
    
    # Analyze data
    print("\nAnalyzing consolidated data...")
    
    # Get date range
    earliest, latest = get_date_range(all_records)
    if earliest and latest:
        print(f"  Date range: {earliest.strftime('%Y-%m-%d')} to {latest.strftime('%Y-%m-%d')}")
        print(f"  Time span: {(latest - earliest).days} days")
    
    # Provider analysis
    provider_counts = analyze_providers(all_records)
    print(f"  Provider distribution:")
    for provider, count in sorted(provider_counts.items()):
        percentage = (count / total_records) * 100
        print(f"    {provider}: {count:,} records ({percentage:.1f}%)")
    
    # Get some sample artists
    artists = set()
    for record in all_records:
        artist = record.get('master_metadata_album_artist_name')
        if artist:
            artists.add(artist)
            if len(artists) >= 10:  # Just get first 10 unique artists
                break
    
    if artists:
        print(f"  Sample artists: {', '.join(sorted(list(artists)[:5]))}...")
    
    # Write consolidated file
    print(f"\nWriting consolidated data to: {output_file}")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(all_records, file, indent=2, ensure_ascii=False)
        
        print(f"✅ Consolidation complete!")
        print(f"   Output file: {output_file}")
        print(f"   Total records: {total_records:,}")
        
        # Check file size
        output_path = Path(output_file)
        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"   File size: {file_size_mb:.1f} MB")
        
    except Exception as e:
        print(f"❌ Error writing output file: {e}")
        return
    
    # Summary statistics
    print(f"\n=== Summary Statistics ===")
    print(f"Successfully consolidated {total_records:,} streaming records")
    print(f"Data spans from {earliest.strftime('%Y-%m-%d') if earliest else 'N/A'} to {latest.strftime('%Y-%m-%d') if latest else 'N/A'}")
    
    # Calculate total listening time
    total_ms = sum(record.get('ms_played', 0) for record in all_records)
    total_hours = total_ms / (1000 * 60 * 60)
    total_days = total_hours / 24
    
    print(f"Total listening time: {total_hours:,.1f} hours ({total_days:.1f} days)")
    
    # Platform breakdown
    platform_counts = {}
    for record in all_records:
        platform = record.get('platform', 'Unknown')
        platform_counts[platform] = platform_counts.get(platform, 0) + 1
    
    print(f"Platform distribution:")
    for platform, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_records) * 100
        print(f"  {platform}: {count:,} records ({percentage:.1f}%)")


def main():
    """Main entry point."""
    # Use relative paths from project root
    base_dir = Path(__file__).parent.parent
    spotify_file = base_dir / 'output' / 'spotify_full_streaming_data_clean.json'
    apple_file = base_dir / 'output' / 'apple_music_full_streaming_data_clean.json'
    output_file = base_dir / 'output' / 'consolidated_full_streaming_data_clean.json'
    
    consolidate_streaming_data(str(spotify_file), str(apple_file), str(output_file))


def consolidate_streaming_data(spotify_file: str, apple_file: str, output_file: str) -> None:
    """Main function to consolidate streaming data files."""
    print("=== Streaming Data Consolidation ===\n")
    
    # Load both files
    spotify_data = load_json_file(spotify_file)
    apple_data = load_json_file(apple_file)
    
    # Check if files were loaded successfully
    if not spotify_data and not apple_data:
        print("Error: No data loaded from either file!")
        return
    
    # Combine all records
    all_records = spotify_data + apple_data
    total_records = len(all_records)
    
    print(f"\nCombining data:")
    print(f"  Spotify records: {len(spotify_data)}")
    print(f"  Apple Music records: {len(apple_data)}")
    print(f"  Total combined records: {total_records}")
    
    # Sort by timestamp for chronological order
    print("\nSorting records by timestamp...")
    all_records.sort(key=lambda x: parse_timestamp(x.get('ts', '')))
    
    # Analyze data
    print("\nAnalyzing consolidated data...")
    
    # Get date range
    earliest, latest = get_date_range(all_records)
    if earliest and latest:
        print(f"  Date range: {earliest.strftime('%Y-%m-%d')} to {latest.strftime('%Y-%m-%d')}")
        print(f"  Time span: {(latest - earliest).days} days")
    
    # Provider analysis
    provider_counts = analyze_providers(all_records)
    print(f"  Provider distribution:")
    for provider, count in sorted(provider_counts.items()):
        percentage = (count / total_records) * 100
        print(f"    {provider}: {count:,} records ({percentage:.1f}%)")
    
    # Get some sample artists
    artists = set()
    for record in all_records:
        artist = record.get('master_metadata_album_artist_name')
        if artist:
            artists.add(artist)
            if len(artists) >= 10:  # Just get first 10 unique artists
                break
    
    if artists:
        print(f"  Sample artists: {', '.join(sorted(list(artists)[:5]))}...")
    
    # Write consolidated file
    print(f"\nWriting consolidated data to: {output_file}")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(all_records, file, indent=2, ensure_ascii=False)
        
        print(f"✅ Consolidation complete!")
        print(f"   Output file: {output_file}")
        print(f"   Total records: {total_records:,}")
        
        # Check file size
        output_path = Path(output_file)
        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"   File size: {file_size_mb:.1f} MB")
        
    except Exception as e:
        print(f"❌ Error writing output file: {e}")
        return
    
    # Summary statistics
    print(f"\n=== Summary Statistics ===")
    print(f"Successfully consolidated {total_records:,} streaming records")
    print(f"Data spans from {earliest.strftime('%Y-%m-%d') if earliest else 'N/A'} to {latest.strftime('%Y-%m-%d') if latest else 'N/A'}")
    
    # Calculate total listening time
    total_ms = sum(record.get('ms_played', 0) for record in all_records)
    total_hours = total_ms / (1000 * 60 * 60)
    total_days = total_hours / 24
    
    print(f"Total listening time: {total_hours:,.1f} hours ({total_days:.1f} days)")
    
    # Platform breakdown
    platform_counts = {}
    for record in all_records:
        platform = record.get('platform', 'Unknown')
        platform_counts[platform] = platform_counts.get(platform, 0) + 1
    
    print(f"Platform distribution:")
    for platform, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_records) * 100
        print(f"  {platform}: {count:,} records ({percentage:.1f}%)")


if __name__ == "__main__":
    main()
