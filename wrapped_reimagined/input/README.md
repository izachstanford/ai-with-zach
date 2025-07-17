# Wrapped Reimagined Input Directory

Place your raw streaming data files here:

## Spotify Data
- `StreamingHistory_music_*.json`
- `endsong_*.json`
- Any JSON files from your Spotify Extended Streaming History download

## Apple Music Data
- `Apple Music - Play History Daily Tracks.csv`
- CSV file from your Apple Music data export

## Directory Structure Example:
```
input/
├── StreamingHistory_music_0.json
├── StreamingHistory_music_1.json
├── endsong_0.json
├── endsong_1.json
└── Apple Music - Play History Daily Tracks.csv
```

The CLI tool will automatically detect and process these files when you run:
```bash
python wrapped_reimagined.py process-all
```
