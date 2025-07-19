# 🎵 Wrapped Reimagined

Transform your Spotify and Apple Music streaming data into rich, actionable insights perfect for web applications and personal analytics dashboards.

## 🚀 Features

- **Multi-Platform Support**: Process both Spotify and Apple Music data
- **Intelligent Artist Matching**: Fuzzy matching between Apple Music and Spotify artists
- **Rich Insights Generation**: Create comprehensive analytics files optimized for web apps
- **CLI Interface**: Simple command-line tool for easy processing
- **Flexible Architecture**: Modular design allowing individual or complete pipeline processing

## 📊 Generated Insights

The tool generates three main insight files:

1. **`lifetime_streaming_stats.json`** (27KB) - Overview statistics and metrics
2. **`annual_recaps.json`** (110KB) - Year-by-year breakdowns with top 50 lists
3. **`artist_summary.json`** (9MB) - Detailed per-artist analytics with yearly data

## 🏗️ Project Structure

```
wrapped_reimagined/
├── wrapped_reimagined.py      # Main CLI tool
├── input/                     # Place your raw data files here
├── output/                    # Generated clean data and insights
├── scripts/                   # Processing scripts
│   ├── spotify_data_cleaner.py
│   ├── apple_music_cleaner.py
│   ├── consolidate_streaming_data.py
│   ├── generate_lifetime_stats.py
│   ├── generate_annual_recaps.py
│   └── generate_artist_summary.py
├── docs/                      # Documentation
├── examples/                  # Example data and configurations
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Python 3.7+
- Required packages: `json`, `csv`, `pathlib`, `datetime`, `collections`, `difflib` (all standard library)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/zachstanford/wrapped_reimagined.git
cd wrapped_reimagined
```

2. Ensure Python 3.7+ is installed:
```bash
python --version
```

3. Make the main script executable:
```bash
chmod +x wrapped_reimagined.py
```

## 📁 Data Requirements

### Spotify Data

Place your Spotify Extended Streaming History files in the `input/` directory:

- `StreamingHistory_music_*.json` 
- `endsong_*.json`
- Or any JSON files containing your Spotify streaming data

**How to get Spotify data:**
1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Request "Extended streaming history" 
3. Wait for email with download link (can take up to 30 days)
4. Extract JSON files to `input/` directory

### Apple Music Data

Place your Apple Music data in the `input/` directory:

- `Apple Music - Play History Daily Tracks.csv`

**How to get Apple Music data:**
1. Go to [Apple Privacy Portal](https://privacy.apple.com/)
2. Sign in and request your data
3. Select "Apple Media Services" 
4. Download and extract the CSV file to `input/` directory

## 🚀 Usage

### Quick Start - Process Everything

```bash
# Process all data with files in input/ directory
python wrapped_reimagined.py process-all

# Process with custom directories
python wrapped_reimagined.py process-all --spotify-dir /path/to/spotify/data --apple-dir /path/to/apple/data

# Process only Spotify data
python wrapped_reimagined.py process-all --skip-apple
```

### Individual Steps

```bash
# Process Spotify data only
python wrapped_reimagined.py process-spotify

# Process Apple Music data only (requires existing Spotify data)
python wrapped_reimagined.py process-apple

# Generate insights from existing consolidated data
python wrapped_reimagined.py generate-insights
```

### Advanced Usage

```bash
# Use custom directories
python wrapped_reimagined.py process-spotify --spotify-dir /path/to/spotify/files

# Specify custom Spotify file for Apple Music processing
python wrapped_reimagined.py process-apple --apple-dir /path/to/apple --spotify-file /path/to/spotify.json
```

## 📈 Output Files

The tool generates several files in the `output/` directory:

### Clean Data Files
- `spotify_full_streaming_data_clean.json` - Cleaned Spotify data
- `apple_music_full_streaming_data_clean.json` - Cleaned Apple Music data  
- `consolidated_full_streaming_data_clean.json` - Combined dataset
- `apple_music_artist_mapping_summary.json` - Artist matching results

### Insight Files
- `lifetime_streaming_stats.json` - Complete lifetime statistics
- `annual_recaps.json` - Year-by-year insights and top lists
- `artist_summary.json` - Detailed per-artist analytics

## 🔧 Data Processing Details

### Spotify Data Processing

- **Filtering**: Removes podcasts, videos, audiobooks, and incognito sessions
- **Quality Control**: Excludes skipped tracks under 30 seconds
- **Standardization**: Converts to unified JSON format
- **Provider Tagging**: Adds "Spotify" provider field

### Apple Music Data Processing

- **Format Conversion**: Converts CSV to JSON matching Spotify structure
- **Artist Matching**: Uses fuzzy matching for top 50 artists by play count
- **Optimization**: Selective matching reduces processing time significantly
- **Data Enrichment**: Maps platform types, countries, and listening behaviors

### Insight Generation

- **Lifetime Statistics**: 12 categories including time, content, behavioral, and diversity metrics
- **Annual Recaps**: Year-by-year breakdowns with top 50 lists and yearly statistics
- **Artist Summaries**: Per-artist analytics with yearly breakdowns and detailed metrics

## 🎯 Use Cases

### Personal Analytics
- Track your music evolution over time
- Identify listening patterns and behaviors
- Discover your top artists, tracks, and genres by year
- Analyze platform usage and preferences

### Web Applications
- Build "Spotify Wrapped" style dashboards
- Create artist detail pages with rich analytics
- Generate annual recap experiences
- Power recommendation systems

### Data Analysis
- Research music consumption patterns
- Study cross-platform listening behaviors
- Analyze music discovery and retention
- Investigate temporal listening trends

## 📋 Example Insights

From your processed data, you can discover:

- **Total listening time**: 2,599 hours across 13 years
- **Peak listening**: Fridays at 2:00 PM in Spring
- **Top artist**: Fall Out Boy with 1,485 streams
- **Platform distribution**: 88% iOS, 4% macOS, 8% other
- **Listening behavior**: 66% completion rate, 18% skip rate
- **Discovery patterns**: 3,962 unique artists, 12,641 unique tracks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- Spotify for providing extended streaming history data
- Apple Music for comprehensive play history exports
- The open-source community for inspiration and tools

## 🐛 Troubleshooting

### Common Issues

**"No Spotify files found"**
- Ensure JSON files are in the correct directory
- Check file names match expected patterns (`StreamingHistory*.json`, `endsong*.json`)

**"Apple Music file not found"**
- Verify CSV file is named correctly (`Apple Music - Play History Daily Tracks.csv`)
- Ensure file is in the specified directory

**"Missing required scripts"**
- Check that all files in `scripts/` directory are present
- Re-clone the repository if files are missing

**Performance Issues**
- Large datasets may take several minutes to process
- Consider processing steps individually for better progress tracking

### Getting Help

1. Check the [Issues](https://github.com/zachstanford/wrapped_reimagined/issues) page
2. Create a new issue with detailed error messages
3. Include sample data structure (anonymized) when possible

## 🔮 Future Features

- Support for additional streaming platforms
- Real-time data processing
- Advanced visualization generators
- Machine learning insights
- Genre classification and analysis
- Social sharing capabilities

---

**Created by [Zach Stanford](https://github.com/zachstanford)**  
🌟 Star this repo if you found it helpful!
