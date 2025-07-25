# 🎵 AI-Powered Music Analytics Pipeline

A complete end-to-end system for transforming your personal music streaming data into rich, interactive insights. This project combines a powerful Python data processor with a sleek React web dashboard to create your own personalized music analytics experience.

> **Live Demo**: [Try the dashboard →](https://tempo-trace-ai.vercel.app) _(coming soon)_

---

## 🚀 What This Project Does

Transform your raw Spotify and Apple Music data into beautiful, interactive visualizations that reveal insights about your listening habits, favorite artists, and musical journey over time. 

**📊 Key Features:**
- Process years of streaming history from multiple platforms
- Generate comprehensive analytics and insights
- Visualize data in a futuristic, cyberpunk-themed web dashboard
- Track concert attendance and its impact on listening patterns
- Discover patterns in your musical evolution

---

## 🏗️ Project Architecture

This project consists of two main components that work together:

```
tempo-trace-ai/
├── music-data-processor/     # 🐍 Python CLI tool for data processing
│   ├── input/               # Raw Spotify & Apple Music files
│   ├── output/              # Processed JSON files
│   ├── scripts/             # Processing pipeline scripts
│   └── wrapped_reimagined.py # Main CLI interface
│
├── tempo-trace-ai/          # ⚛️ React web dashboard
│   ├── src/                 # React components & logic
│   ├── public/              # Static assets and JSON data
│   └── dist/                # Built application
│
└── README.md                # This file
```

## Requirements

- **Python**: version 3.8 or higher
- **Node.js**: version 18 or higher

## 🔄 Complete Workflow

### Step 1: Get Your Data
**Spotify Extended Streaming History:**
1. Visit [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Request "Extended streaming history" (takes up to 30 days)
3. Download and extract JSON files

**Apple Music Data:**
1. Visit [Apple Privacy Portal](https://privacy.apple.com/)
2. Request your data → Select "Apple Media Services"
3. Download the CSV file: `Apple Music - Play History Daily Tracks.csv`

### Step 2: Process Your Data
```bash
# Navigate to the data processor
cd music-data-processor

# Place your data files in the input/ directory
cp /path/to/spotify/files/*.json input/
cp /path/to/apple/music/*.csv input/

# Run the complete processing pipeline
python wrapped_reimagined.py process-all
```

**Output Files Generated:**
- `lifetime_streaming_stats.json` (27KB) - Overview statistics
- `annual_recaps.json` (110KB) - Year-by-year insights  
- `artist_summary.json` (9MB) - Detailed per-artist analytics
- `concerts.json` - Concert attendance data (optional)

### Step 3: Copy Data to Web App
```bash
# Copy processed files to the web dashboard
cp output/*.json ../tempo-trace-ai/public/data/
```

### Step 4: Launch the Dashboard
```bash
# Navigate to the web app
cd ../tempo-trace-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to explore your music analytics!

---

## 📊 What You'll Discover

### 🎯 The Pulse
- **Lifetime Overview**: Total streams, hours listened, unique artists/albums/tracks
- **Smart Analytics**: Skip rate, discovery rate, listening patterns
- **Performance Metrics**: Peak listening hours, platform usage, session analytics

### 🏆 Leaderboard  
- **Top Artists/Albums/Tracks**: Ranked by plays or listening time
- **Time Range Filters**: 7 days, 30 days, 90 days, 6 months, 12 months, lifetime
- **Dynamic Switching**: Toggle between "Most Played" and "Most Time" metrics

### 🧭 Concert Compass
- **Concert Impact Analysis**: Visualize how live shows affect your listening patterns
- **Bucket List Progress**: Track your top 20 artists and see which ones you've seen live
- **Concert History**: Complete timeline of your live music experiences

### 📈 Example Insights
From your processed data, you might discover:
- **Total listening time**: 2,599 hours across 13 years
- **Peak listening**: Fridays at 2:00 PM in Spring
- **Top artist**: Fall Out Boy with 1,485 streams
- **Platform distribution**: 88% iOS, 4% macOS, 8% other
- **Listening behavior**: 66% completion rate, 18% skip rate
- **Discovery patterns**: 3,962 unique artists, 12,641 unique tracks

---

## 🧪 Testing the Complete Pipeline

Want to verify everything works correctly? Run the included test script:

```bash
# Make the test script executable (if needed)
chmod +x test-pipeline.sh

# Run the complete pipeline test
./test-pipeline.sh
```

This script tests:
- ✅ Python data processor functionality
- ✅ Node.js web dashboard build process
- ✅ File structure and documentation
- ✅ Complete workflow integration

## 🛠️ Developer Notes

When working locally:

1. Always activate the virtual environment:

   ```bash
   source .venv/bin/activate
   ```

2. Install new packages as needed, then update requirements:

   ```bash
   pip install <package-name>
   pip freeze > requirements.txt
   ```

3. For running Streamlit applications:

   ```bash
   streamlit run <filename>.py
   ```

4. When done:

   ```bash
   deactivate
   ```


## 🛠️ Technical Details

### Data Processing Pipeline
- **Multi-platform support**: Spotify and Apple Music
- **Intelligent matching**: Fuzzy matching between platforms
- **Quality control**: Filters out podcasts, skips, and low-quality data
- **Rich insights**: Generates 12+ categories of analytics

### Web Dashboard
- **React 18** with Vite for fast development
- **TailwindCSS** for responsive, modern styling
- **Chart.js** for interactive data visualizations
- **Futuristic UI**: Cyberpunk-themed design with neon accents

### Key Technologies
- **Backend**: Python 3.7+, standard library only
- **Frontend**: React, TailwindCSS, Chart.js, Lucide React
- **Data**: JSON-based pipeline for portability
- **Performance**: Optimized for large datasets (millions of streams)

---

## 📁 Detailed Component Documentation

### 📖 Music Data Processor
The Python CLI tool that transforms raw streaming data into structured insights.

**[View detailed documentation →](music-data-processor/README.md)**

Key features:
- Process Spotify Extended Streaming History
- Handle Apple Music CSV exports
- Generate comprehensive analytics
- Fuzzy artist matching between platforms
- CLI interface for easy automation

### 📖 Tempo Trace AI Dashboard
The React web application that visualizes your music analytics.

**[View detailed documentation →](tempo-trace-ai/README.md)**

Key features:
- Interactive charts and visualizations
- Real-time data filtering and sorting
- Concert impact analysis
- Responsive design for all devices
- Futuristic cyberpunk aesthetic

---

## 🎨 Design Philosophy

**Futuristic Cyber Aesthetic:**
- Dark backgrounds with neon accents (#00f5ff, #8b5cf6)
- Glowing borders and smooth hover effects
- Orbitron font for headers, Inter for body text
- Animated particles and transitions
- Sci-fi inspired UI elements

**Performance Focused:**
- Efficient data processing for large datasets
- Smooth animations and interactions
- Responsive design for all screen sizes
- Optimized build and deployment

---

## 🤝 Contributing

This project is open source and welcomes contributions! Whether you want to:

- Add support for additional streaming platforms
- Improve the UI/UX design
- Add new analytics and insights
- Optimize performance
- Fix bugs or add features

**Getting Started:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

**Development Setup:**
```bash
# For Python development
cd music-data-processor
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# For React development
cd tempo-trace-ai
npm install
npm run dev
```

---

## 📧 About the Author

**Zach Stanford** — Data engineer, AI enthusiast, and music lover with 10+ years of experience building analytics platforms at companies like Block, DoorDash, and Goldman Sachs.

- 🔗 [LinkedIn](https://www.linkedin.com/in/zachstanford1/)
- 🌐 [Personal Website & Blog](https://aiwithzach.com/)
- 🐙 [GitHub](https://github.com/zachstanford)

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spotify** for providing extended streaming history data
- **Apple Music** for comprehensive play history exports
- **The open-source community** for inspiration and tools
- **Chart.js** for beautiful, interactive visualizations
- **TailwindCSS** for making CSS enjoyable again

---

**🌟 Star this repo if you found it helpful!**

*Built with ❤️ for music data nerds and AI enthusiasts*
