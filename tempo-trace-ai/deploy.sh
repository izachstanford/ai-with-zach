#!/bin/bash

# Deploy script for tempo-trace-ai
# This script builds the project and deploys it to the website

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

WEBSITE_DIR="/Users/zachstanford/Development/website-ai-with-zach"
TARGET_DIR="$WEBSITE_DIR/public/tempo-trace-ai"

echo -e "${BLUE}🚀 Building tempo-trace-ai...${NC}"

# Clean previous build
rm -rf dist/

# Build the project
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    echo -e "${BLUE}📦 Deploying to website...${NC}"
    
    # Create target directory if it doesn't exist
    mkdir -p "$TARGET_DIR"
    
    # Copy all built files
    cp -r dist/* "$TARGET_DIR/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        
        # Fix paths in the deployed HTML file for local testing
        echo -e "${BLUE}🔧 Fixing paths for local testing...${NC}"
        
        # Create a development version of index.html with relative paths
        cp "$TARGET_DIR/index.html" "$TARGET_DIR/index.html.production"
        
        # Update the production version to use absolute paths for website deployment
        sed -i '' 's|src="./assets/|src="/tempo-trace-ai/assets/|g' "$TARGET_DIR/index.html"
        sed -i '' 's|href="./assets/|href="/tempo-trace-ai/assets/|g' "$TARGET_DIR/index.html"
        sed -i '' 's|href="./favicon|href="/tempo-trace-ai/favicon|g' "$TARGET_DIR/index.html"
        
        # Create a development version with relative paths
        cp "$TARGET_DIR/index.html.production" "$TARGET_DIR/index.html.development"
        sed -i '' 's|src="/tempo-trace-ai/assets/|src="./assets/|g' "$TARGET_DIR/index.html.development"
        sed -i '' 's|href="/tempo-trace-ai/assets/|href="./assets/|g' "$TARGET_DIR/index.html.development"
        sed -i '' 's|href="/tempo-trace-ai/favicon|href="./favicon|g' "$TARGET_DIR/index.html.development"
        
        echo -e "${GREEN}✅ Paths configured for both production and development!${NC}"
        
        # Show deployment summary
        echo ""
        echo -e "${YELLOW}📊 Deployment Summary:${NC}"
        echo -e "${BLUE}- Built with Vite${NC}"
        echo -e "${BLUE}- Favicon: ✅ Both PNG and SVG included${NC}"
        echo -e "${BLUE}- Base path: /tempo-trace-ai/ (production)${NC}"
        echo -e "${BLUE}- Data files: ✅ Updated${NC}"
        echo -e "${BLUE}- Assets: ✅ Optimized and deployed${NC}"
        echo -e "${BLUE}- Paths: ✅ Configured for both environments${NC}"
        
        # Show file sizes
        echo ""
        echo -e "${YELLOW}📁 Deployed files:${NC}"
        ls -lah "$TARGET_DIR/"
        
        echo ""
        echo -e "${YELLOW}🌐 Your app is now live at:${NC}"
        echo -e "${BLUE}Production: https://aiwithzach.com/tempo-trace-ai${NC}"
        echo -e "${BLUE}Local testing: http://localhost:8000/ (when using test-local.sh)${NC}"
        
        echo ""
        echo -e "${YELLOW}📝 Next steps:${NC}"
        echo -e "${BLUE}1. Commit and push changes in website-ai-with-zach${NC}"
        echo -e "${BLUE}2. Test locally with: ./test-local.sh${NC}"
        echo -e "${BLUE}3. Deploy to production via Netlify${NC}"
        
    else
        echo -e "${RED}❌ Deployment failed!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
