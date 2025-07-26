#!/bin/bash

# Deploy script for tempo-trace-ai
# This script builds the project and deploys it to the website

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located (TempoTraceAI dev repo)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="/Users/zachstanford/Development/website-ai-with-zach"
TARGET_DIR="$WEBSITE_DIR/public/tempo-trace-ai"

echo -e "${BLUE}🎵 Deploying TempoTraceAI from development environment...${NC}"
echo -e "${BLUE}Development repo: $SCRIPT_DIR${NC}"
echo -e "${BLUE}Target: $TARGET_DIR${NC}"

# Change to the TempoTraceAI development directory
cd "$SCRIPT_DIR"

echo -e "\n${BLUE}🚀 Building tempo-trace-ai...${NC}"

# Clean previous build
rm -rf dist/

# Build the project
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    echo -e "${BLUE}📦 Deploying to website...${NC}"
    
    # Create target directory if it doesn't exist
    mkdir -p "$TARGET_DIR"
    
    # Clean the target directory first
    rm -rf "$TARGET_DIR"/*
    
    # Copy only the essential built files
    echo -e "${BLUE}Copying built files...${NC}"
    
    # Copy the main HTML file
    if [ -f "dist/index.html" ]; then
        cp dist/index.html "$TARGET_DIR/"
        echo -e "${GREEN}✓ Copied index.html${NC}"
    else
        echo -e "${RED}✗ index.html not found in dist${NC}"
        exit 1
    fi
    
    # Copy assets directory (JavaScript, CSS)
    if [ -d "dist/assets" ]; then
        cp -r dist/assets "$TARGET_DIR/"
        echo -e "${GREEN}✓ Copied assets directory${NC}"
    else
        echo -e "${RED}✗ assets directory not found in dist${NC}"
        exit 1
    fi
    
    # Copy data directory
    if [ -d "dist/data" ]; then
        cp -r dist/data "$TARGET_DIR/"
        echo -e "${GREEN}✓ Copied data directory${NC}"
    else
        echo -e "${RED}✗ data directory not found in dist${NC}"
        exit 1
    fi
    
    # Copy only the essential favicon (SVG version)
    if [ -f "dist/favicon.svg" ]; then
        cp dist/favicon.svg "$TARGET_DIR/"
        echo -e "${GREEN}✓ Copied favicon.svg${NC}"
    fi
    
    # Copy any other essential files (like apple-touch-icon if needed)
    if [ -f "dist/apple-touch-icon.png" ]; then
        cp dist/apple-touch-icon.png "$TARGET_DIR/"
        echo -e "${GREEN}✓ Copied apple-touch-icon.png${NC}"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        
        # Show deployment summary
        echo ""
        echo -e "${YELLOW}📊 Deployment Summary:${NC}"
        echo -e "${BLUE}- Built with Vite from development repo${NC}"
        echo -e "${BLUE}- Favicon: ✅ SVG only (clean)${NC}"
        echo -e "${BLUE}- Base path: /tempo-trace-ai/ (production)${NC}"
        echo -e "${BLUE}- Data files: ✅ Updated${NC}"
        echo -e "${BLUE}- Assets: ✅ Optimized and deployed${NC}"
        echo -e "${BLUE}- Clean: ✅ Only built files copied${NC}"
        
        # Show file sizes
        echo ""
        echo -e "${YELLOW}📁 Deployed files:${NC}"
        ls -lah "$TARGET_DIR/"
        
        echo ""
        echo -e "${YELLOW}🌐 Your app is now live at:${NC}"
        echo -e "${BLUE}Production: https://aiwithzach.com/tempo-trace-ai${NC}"
        echo -e "${BLUE}Local testing: npm run preview${NC}"
        
        echo ""
        echo -e "${YELLOW}📝 Next steps:${NC}"
        echo -e "${BLUE}1. Test locally: npm run preview${NC}"
        echo -e "${BLUE}2. Commit and push changes in website-ai-with-zach${NC}"
        echo -e "${BLUE}3. Deploy to production via Netlify${NC}"
        
    else
        echo -e "${RED}❌ Deployment failed!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
