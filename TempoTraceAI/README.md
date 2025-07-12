# TempoTraceAI 🎵

A sleek, futuristic music analytics dashboard that transforms your listening history into deep insights. Built with React, TailwindCSS, and Chart.js.

## Features

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
- **Interactive Charts**: Monthly listening volume plotted against concert dates

## Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js + react-chartjs-2** - Beautiful, interactive charts
- **Lucide React** - Stunning icons
- **date-fns** - Date manipulation utilities

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Data Format

### Streaming Data (`consolidated_streaming_history.json`)
```json
{
  "ts": "2022-11-30T22:44:26Z",
  "ms_played": 1702,
  "skip": true,
  "track_name": "Track Name",
  "album_name": "Album Name", 
  "artist_name": "Artist Name",
  "provider": "Spotify",
  "platform": "ios",
  "spotify_track_uri": "spotify:track:..."
}
```

### Concert Data (`concerts.json`)
```json
{
  "date": "2022-09-20",
  "artist": "Artist Name",
  "type": "headliner",
  "venue": "Venue Name",
  "vibe_rating": 5.0
}
```

## Design Philosophy

**Futuristic Cyber Aesthetic**:
- Dark backgrounds with neon accents
- Glowing borders and hover effects
- Animated particles and smooth transitions
- Orbitron font for headers, Inter for body text
- Cyber-blue (#00f5ff) and cyber-purple (#8b5cf6) color scheme

**Performance Focused**:
- Efficient data processing and caching
- Smooth animations and transitions
- Responsive design for all screen sizes
- Lazy loading and optimization

## Key Features

- **Real-time Analytics**: Process thousands of streams instantly
- **Interactive Visualizations**: Hover, click, and explore your data
- **Smart Insights**: Discover patterns you never knew existed
- **Concert Integration**: See how live music influences your listening
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Futuristic UI**: Feel like you're in a sci-fi movie

## Contributing

Feel free to submit issues and enhancement requests! This project is built with love for music data nerds.

## License

MIT License - feel free to use this for your own music analytics projects!

---

*Powered by your musical journey • Built with ❤️ and AI*
