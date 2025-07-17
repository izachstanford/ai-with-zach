# Wrapped Reimagined Output Directory

This directory contains all generated files from the processing pipeline:

## Clean Data Files
- `spotify_full_streaming_data_clean.json` - Cleaned and filtered Spotify data
- `apple_music_full_streaming_data_clean.json` - Cleaned Apple Music data in Spotify format
- `consolidated_full_streaming_data_clean.json` - Combined dataset from both platforms
- `apple_music_artist_mapping_summary.json` - Artist fuzzy matching results

## Insight Files (Web App Ready)
- `lifetime_streaming_stats.json` (~27KB) - Complete lifetime statistics and metrics
- `annual_recaps.json` (~110KB) - Year-by-year breakdowns with top 50 lists
- `artist_summary.json` (~9MB) - Detailed per-artist analytics with yearly data

## File Usage

### For Web Applications
- Load `lifetime_streaming_stats.json` for dashboard overview pages
- Use `annual_recaps.json` for year-specific "Wrapped" style pages
- Query `artist_summary.json` for detailed artist pages and search

### For Data Analysis
- `consolidated_full_streaming_data_clean.json` contains all raw streaming events
- Insight files provide pre-calculated metrics for faster analysis
- All files are in JSON format for easy consumption by any application

## File Sizes (Approximate)
Based on ~51,000 streaming records and ~4,000 artists:
- Clean data files: ~40MB total
- Insight files: ~9MB total
- Perfect for web deployment and API consumption
