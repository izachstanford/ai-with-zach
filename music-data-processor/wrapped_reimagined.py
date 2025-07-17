#!/usr/bin/env python3
"""
Wrapped Reimagined - Music Streaming Data Processor

A comprehensive tool for processing and analyzing music streaming data from Spotify and Apple Music.
Generates insights perfect for web applications and personal analytics.

Usage:
    python wrapped_reimagined.py process-all [OPTIONS]
    python wrapped_reimagined.py process-spotify [OPTIONS]
    python wrapped_reimagined.py process-apple [OPTIONS]
    python wrapped_reimagined.py generate-insights [OPTIONS]

Author: Zach Stanford
Repository: https://github.com/zachstanford/wrapped_reimagined
"""

import argparse
import json
import sys
import subprocess
from pathlib import Path
from typing import Optional, List
import time
import shutil


class WrappedReimaginedCLI:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.input_dir = self.base_dir / "input"
        self.output_dir = self.base_dir / "output"
        self.scripts_dir = self.base_dir / "scripts"
        
        # Ensure directories exist
        self.input_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        self.scripts_dir.mkdir(exist_ok=True)
    
    def print_banner(self):
        """Print the application banner."""
        print("=" * 80)
        print("🎵 WRAPPED REIMAGINED - Music Streaming Data Processor")
        print("=" * 80)
        print("Transform your Spotify and Apple Music data into rich insights")
        print("https://github.com/zachstanford/wrapped_reimagined")
        print("=" * 80)
    
    def check_dependencies(self) -> bool:
        """Check if all required scripts exist."""
        required_scripts = [
            "spotify_data_cleaner.py",
            "apple_music_cleaner.py", 
            "consolidate_streaming_data.py",
            "generate_lifetime_stats.py",
            "generate_annual_recaps.py",
            "generate_artist_summary.py"
        ]
        
        missing = []
        for script in required_scripts:
            if not (self.scripts_dir / script).exists():
                missing.append(script)
        
        if missing:
            print(f"❌ Missing required scripts: {', '.join(missing)}")
            print("Please ensure all scripts are in the scripts/ directory")
            return False
        
        return True
    
    def run_script(self, script_name: str, args: List[str] = None) -> bool:
        """Run a script with optional arguments."""
        script_path = self.scripts_dir / script_name
        cmd = [sys.executable, str(script_path)]
        
        if args:
            cmd.extend(args)
        
        try:
            print(f"Running {script_name}...")
            result = subprocess.run(cmd, cwd=self.base_dir, capture_output=False)
            
            if result.returncode == 0:
                print(f"✅ {script_name} completed successfully")
                return True
            else:
                print(f"❌ {script_name} failed with return code {result.returncode}")
                return False
                
        except Exception as e:
            print(f"❌ Error running {script_name}: {e}")
            return False
    
    def find_spotify_files(self, spotify_dir: Optional[str] = None) -> List[Path]:
        """Find Spotify streaming history files."""
        if spotify_dir:
            search_dir = Path(spotify_dir)
        else:
            search_dir = self.input_dir
        
        patterns = [
            "**/StreamingHistory*.json",
            "**/endsong*.json", 
            "**/Streaming_History*.json"
        ]
        
        files = []
        for pattern in patterns:
            files.extend(search_dir.glob(pattern))
        
        return sorted(files)
    
    def find_apple_music_file(self, apple_dir: Optional[str] = None) -> Optional[Path]:
        """Find Apple Music streaming history file."""
        if apple_dir:
            search_dir = Path(apple_dir)
        else:
            search_dir = self.input_dir
        
        patterns = [
            "**/Apple Music - Play History Daily Tracks.csv",
            "**/Play History Daily Tracks.csv",
            "**/*apple*music*.csv"
        ]
        
        for pattern in patterns:
            files = list(search_dir.glob(pattern))
            if files:
                return files[0]
        
        return None
    
    def process_spotify(self, spotify_dir: Optional[str] = None) -> bool:
        """Process Spotify streaming data."""
        print("\n🎵 Processing Spotify Data...")
        
        # Find Spotify files
        spotify_files = self.find_spotify_files(spotify_dir)
        
        if not spotify_files:
            print("❌ No Spotify files found!")
            print("Expected files: StreamingHistory*.json or endsong*.json")
            print(f"Search directory: {spotify_dir or self.input_dir}")
            return False
        
        print(f"Found {len(spotify_files)} Spotify files:")
        for file in spotify_files:
            print(f"  - {file.name}")
        
        # Create file list for script
        file_args = [str(f) for f in spotify_files]
        
        return self.run_script("spotify_data_cleaner.py", file_args)
    
    def process_apple(self, apple_dir: Optional[str] = None, spotify_file: Optional[str] = None) -> bool:
        """Process Apple Music streaming data."""
        print("\n🍎 Processing Apple Music Data...")
        
        # Find Apple Music file
        apple_file = self.find_apple_music_file(apple_dir)
        
        if not apple_file:
            print("❌ No Apple Music file found!")
            print("Expected file: Apple Music - Play History Daily Tracks.csv")
            print(f"Search directory: {apple_dir or self.input_dir}")
            return False
        
        # Find Spotify clean file for artist matching
        if not spotify_file:
            spotify_file = self.output_dir / "spotify_full_streaming_data_clean.json"
        
        if not Path(spotify_file).exists():
            print(f"❌ Spotify clean file not found: {spotify_file}")
            print("Run process-spotify first or specify --spotify-file")
            return False
        
        print(f"Found Apple Music file: {apple_file.name}")
        print(f"Using Spotify file for matching: {Path(spotify_file).name}")
        
        return self.run_script("apple_music_cleaner.py", [str(apple_file), str(spotify_file)])
    
    def consolidate_data(self) -> bool:
        """Consolidate Spotify and Apple Music data."""
        print("\n🔄 Consolidating Data...")
        
        spotify_file = self.output_dir / "spotify_full_streaming_data_clean.json"
        apple_file = self.output_dir / "apple_music_full_streaming_data_clean.json"
        
        if not spotify_file.exists():
            print(f"❌ Spotify clean file not found: {spotify_file}")
            return False
        
        if not apple_file.exists():
            print(f"❌ Apple Music clean file not found: {apple_file}")
            return False
        
        return self.run_script("consolidate_streaming_data.py")
    
    def generate_insights(self) -> bool:
        """Generate all insight files."""
        print("\n📊 Generating Insights...")
        
        consolidated_file = self.output_dir / "consolidated_full_streaming_data_clean.json"
        
        if not consolidated_file.exists():
            print(f"❌ Consolidated file not found: {consolidated_file}")
            return False
        
        # Generate all three insight files
        scripts = [
            "generate_lifetime_stats.py",
            "generate_annual_recaps.py", 
            "generate_artist_summary.py"
        ]
        
        success_count = 0
        for script in scripts:
            if self.run_script(script):
                success_count += 1
        
        return success_count == len(scripts)
    
    def process_all(self, spotify_dir: Optional[str] = None, apple_dir: Optional[str] = None, 
                   skip_apple: bool = False) -> bool:
        """Run the complete processing pipeline."""
        print("\n🚀 Starting Complete Processing Pipeline...")
        
        start_time = time.time()
        
        # Step 1: Process Spotify
        if not self.process_spotify(spotify_dir):
            return False
        
        # Step 2: Process Apple Music (optional)
        if not skip_apple:
            if not self.process_apple(apple_dir):
                print("⚠️  Apple Music processing failed, continuing with Spotify-only data...")
        
        # Step 3: Consolidate data
        if not self.consolidate_data():
            return False
        
        # Step 4: Generate insights
        if not self.generate_insights():
            return False
        
        # Success summary
        total_time = time.time() - start_time
        print(f"\n🎉 Processing Complete! ({total_time:.1f}s)")
        
        # Show output files
        self.show_output_summary()
        
        return True
    
    def show_output_summary(self):
        """Show summary of generated files."""
        print("\n📁 Generated Files:")
        
        output_files = [
            ("spotify_full_streaming_data_clean.json", "Clean Spotify data"),
            ("apple_music_full_streaming_data_clean.json", "Clean Apple Music data"),
            ("consolidated_full_streaming_data_clean.json", "Combined streaming data"),
            ("lifetime_streaming_stats.json", "Lifetime statistics"),
            ("annual_recaps.json", "Year-by-year insights"),
            ("artist_summary.json", "Per-artist analytics")
        ]
        
        total_size = 0
        for filename, description in output_files:
            filepath = self.output_dir / filename
            if filepath.exists():
                size_mb = filepath.stat().st_size / (1024 * 1024)
                total_size += size_mb
                print(f"✅ {filename} ({size_mb:.1f} MB) - {description}")
            else:
                print(f"❌ {filename} - {description}")
        
        print(f"\nTotal size: {total_size:.1f} MB")
        print(f"Output directory: {self.output_dir}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Process music streaming data into rich insights",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all data (Spotify + Apple Music)
  python wrapped_reimagined.py process-all

  # Process only Spotify data
  python wrapped_reimagined.py process-spotify --spotify-dir /path/to/spotify/data

  # Process all with custom directories
  python wrapped_reimagined.py process-all --spotify-dir /path/to/spotify --apple-dir /path/to/apple

  # Generate insights from existing consolidated data
  python wrapped_reimagined.py generate-insights
        """
    )
    
    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Process all command
    process_all_parser = subparsers.add_parser('process-all', help='Run complete processing pipeline')
    process_all_parser.add_argument('--spotify-dir', help='Directory containing Spotify data files')
    process_all_parser.add_argument('--apple-dir', help='Directory containing Apple Music data files')
    process_all_parser.add_argument('--skip-apple', action='store_true', help='Skip Apple Music processing')
    
    # Process Spotify command
    spotify_parser = subparsers.add_parser('process-spotify', help='Process Spotify data only')
    spotify_parser.add_argument('--spotify-dir', help='Directory containing Spotify data files')
    
    # Process Apple Music command
    apple_parser = subparsers.add_parser('process-apple', help='Process Apple Music data only')
    apple_parser.add_argument('--apple-dir', help='Directory containing Apple Music data files')
    apple_parser.add_argument('--spotify-file', help='Path to clean Spotify file for artist matching')
    
    # Generate insights command
    insights_parser = subparsers.add_parser('generate-insights', help='Generate insight files from consolidated data')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Create CLI instance
    cli = WrappedReimaginedCLI()
    cli.print_banner()
    
    # Check dependencies
    if not cli.check_dependencies():
        sys.exit(1)
    
    # Execute command
    success = False
    
    if args.command == 'process-all':
        success = cli.process_all(
            spotify_dir=args.spotify_dir,
            apple_dir=args.apple_dir,
            skip_apple=args.skip_apple
        )
    elif args.command == 'process-spotify':
        success = cli.process_spotify(spotify_dir=args.spotify_dir)
    elif args.command == 'process-apple':
        success = cli.process_apple(apple_dir=args.apple_dir, spotify_file=args.spotify_file)
    elif args.command == 'generate-insights':
        success = cli.generate_insights()
    else:
        parser.print_help()
        sys.exit(1)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
