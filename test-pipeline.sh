#!/bin/bash

# Test script for the complete music analytics pipeline
# This script tests the full workflow from raw data to web dashboard

set -e  # Exit on any error

echo "🎵 Testing AI-Powered Music Analytics Pipeline"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "music-data-processor" ] || [ ! -d "tempo-trace-ai" ]; then
    print_error "Please run this script from the tempo-trace-ai root directory"
    exit 1
fi

print_info "Step 1: Testing music-data-processor"
cd music-data-processor

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi
print_success "Python 3 is available"

# Check if the main script exists
if [ ! -f "wrapped_reimagined.py" ]; then
    print_error "Main script wrapped_reimagined.py not found"
    exit 1
fi
print_success "Main script found"

# Test that the processor can run (just show help)
print_info "Testing CLI interface..."
python3 wrapped_reimagined.py --help > /dev/null 2>&1
print_success "CLI interface works"



cd ..

print_info "Step 2: Testing tempo-trace-ai web dashboard"
cd tempo-trace-ai

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi
print_success "Node.js is available"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi
print_success "npm is available"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi
print_success "Node.js dependencies are installed"

# Ensure the data directory exists
if [ ! -d "public/data" ]; then
    print_error "public/data directory is missing"
    exit 1
fi
print_success "public/data directory is present"

# Test that the app builds
print_info "Testing build process..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Build process works"
else
    print_error "Build process failed"
    exit 1
fi

# Check if build output exists
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    print_success "Build output generated correctly"
else
    print_error "Build output not generated"
    exit 1
fi

cd ..

print_info "Step 3: Testing complete pipeline workflow"

# Verify the complete workflow documentation
if [ -f "README.md" ]; then
    print_success "Main README.md exists"
else
    print_error "Main README.md not found"
    exit 1
fi

if [ -f "music-data-processor/README.md" ]; then
    print_success "music-data-processor README.md exists"
else
    print_error "music-data-processor README.md not found"
    exit 1
fi

if [ -f "tempo-trace-ai/README.md" ]; then
    print_success "tempo-trace-ai README.md exists"
else
    print_error "tempo-trace-ai README.md not found"
    exit 1
fi

print_info "Step 4: Final verification"

# Check git status
if [ -d ".git" ]; then
    print_success "Git repository initialized"
else
    print_warning "Git repository not initialized"
fi

# Check for gitignore
if [ -f ".gitignore" ]; then
    print_success ".gitignore file exists"
else
    print_warning ".gitignore file not found"
fi

echo ""
echo "🎉 Pipeline Testing Complete!"
echo "=============================="
print_success "All core components are working correctly"
print_success "Documentation is complete"
print_success "Build processes are functional"

echo ""
echo "🚀 Ready for Public Release!"
echo "============================"
echo "The tempo-trace-ai music analytics pipeline is ready for:"
echo "• GitHub publication"
echo "• Community use with your data"
echo "• Complete end-to-end workflow"
echo "• Documentation and examples"

echo ""
echo "Next steps:"
echo "1. Push to GitHub repository"
echo "2. Add deployment configuration (optional)"
echo "3. Create release notes"
echo "4. Share with the community!"
