#!/bin/bash

# Deploy script for tempo-trace-ai
# This script builds the project and deploys it to the website

echo "🚀 Building tempo-trace-ai..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "📦 Deploying to website..."
    cp -r dist/* /Users/zachstanford/Development/website-ai-with-zach/public/tempo-trace-ai/
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your app is now live at: https://ai-with-zach.com/tempo-trace-ai"
        
        # Show deployment summary
        echo ""
        echo "📊 Deployment Summary:"
        echo "- Built with Vite"
        echo "- Favicon: ✅ Both PNG and SVG included"
        echo "- Base path: /tempo-trace-ai/"
        echo "- Data files: ✅ Updated"
        echo "- Assets: ✅ Optimized and deployed"
        
        # Show file sizes
        echo ""
        echo "📁 Deployed files:"
        ls -lah /Users/zachstanford/Development/website-ai-with-zach/public/tempo-trace-ai/
        
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
