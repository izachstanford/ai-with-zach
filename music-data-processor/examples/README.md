# Example Data Structures

This directory contains example data structures and sample configurations to help you understand the input and output formats.

## Input Data Examples

### Spotify Extended Streaming History (JSON)
```json
{
  "ts": "2023-01-15T10:30:00Z",
  "platform": "iOS 16.1 (iPhone14,2)",
  "ms_played": 245000,
  "conn_country": "US",
  "ip_addr": "192.168.1.100",
  "master_metadata_track_name": "Anti-Hero",
  "master_metadata_album_artist_name": "Taylor Swift",
  "master_metadata_album_album_name": "Midnights",
  "spotify_track_uri": "spotify:track:4jbmgIyjGoXjY01XxatOx6",
  "reason_start": "trackdone",
  "reason_end": "trackdone",
  "shuffle": false,
  "skipped": false,
  "offline": false,
  "incognito_mode": false
}
```

### Apple Music Play History (CSV)
```csv
Track Description,Media type,Play Duration Milliseconds,Date Played,Hours,Source Type,Country,End Reason Type,Skip Count
"Taylor Swift - Anti-Hero",AUDIO,245000,20230115,10,IPHONE,"United States","NATURAL_END_OF_TRACK",0
```

## Output Data Examples

### Consolidated Streaming Data
```json
{
  "ts": "2023-01-15T10:30:00Z",
  "platform": "iOS",
  "ms_played": 245000,
  "conn_country": "US",
  "master_metadata_track_name": "Anti-Hero",
  "master_metadata_album_artist_name": "Taylor Swift",
  "provider": "Spotify",
  "skipped": false,
  "reason_end": "trackdone"
}
```

### Lifetime Statistics Structure
```json
{
  "metadata": {
    "generated_at": "2024-01-15T10:30:00Z",
    "total_records": 51122
  },
  "time_stats": {
    "total_hours": 2599.6,
    "total_days": 108.3,
    "average_track_length_minutes": 3.1
  },
  "top_lists": {
    "top_artists": [["Taylor Swift", 1485], ["Ed Sheeran", 1205]],
    "top_tracks": [["Anti-Hero", 89], ["Shape of You", 67]]
  }
}
```

### Annual Recap Structure
```json
{
  "2023": {
    "year": 2023,
    "top_artists": [["Taylor Swift", 338], ["Ed Sheeran", 245]],
    "top_tracks": [["Anti-Hero", 89], ["Flowers", 67]],
    "year_stats": {
      "total_plays": 4673,
      "total_hours": 244.2,
      "unique_artists": 892,
      "peak_month": "December"
    }
  }
}
```

### Artist Summary Structure
```json
{
  "Taylor Swift": {
    "total_streams": 1485,
    "total_hours": 81.9,
    "years_active": 10,
    "first_played": "2014-01-15T10:30:00Z",
    "peak_year": "2023",
    "yearly_breakdown": {
      "2023": {
        "streams": 338,
        "hours": 20.2,
        "unique_tracks": 45
      }
    },
    "top_tracks": [["Anti-Hero", 89], ["Shake It Off", 67]]
  }
}
```

## Configuration Examples

### Processing Large Datasets
For datasets with 100,000+ records, consider:
- Processing in chunks during development
- Using SSD storage for faster I/O
- Ensuring adequate RAM (4GB+ recommended)

### Custom File Patterns
The CLI supports various file naming patterns:
- `StreamingHistory*.json`
- `endsong*.json`
- `Streaming_History*.json`
- `*apple*music*.csv`

## Web App Integration Examples

### React/Next.js Usage
```javascript
// Load lifetime stats for dashboard
const stats = await fetch('/api/lifetime_stats.json').then(r => r.json());

// Load specific year recap
const recap2023 = await fetch('/api/annual_recaps.json')
  .then(r => r.json())
  .then(data => data['2023']);

// Search artist data
const artist = await fetch('/api/artist_summary.json')
  .then(r => r.json())
  .then(data => data['Taylor Swift']);
```

### API Endpoint Structure
```
GET /api/stats/lifetime - Return lifetime_streaming_stats.json
GET /api/stats/annual/:year - Return specific year from annual_recaps.json
GET /api/artists/:name - Return specific artist from artist_summary.json
GET /api/artists/search?q=term - Search artists by name
```
