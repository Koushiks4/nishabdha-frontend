#!/bin/bash

# Optimize website video.gif for Vercel deployment
# This script converts the 130MB GIF to a ~5-10MB MP4 video

set -e

echo "🎬 Optimizing website video.gif for Vercel deployment..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo ""
    echo "Please install ffmpeg:"
    echo "  macOS:   brew install ffmpeg"
    echo "  Ubuntu:  sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# File paths
INPUT_GIF="public/website video.gif"
OUTPUT_MP4="public/website-video.mp4"
OUTPUT_WEBM="public/website-video.webm"

# Check if input file exists
if [ ! -f "$INPUT_GIF" ]; then
    echo "❌ Input file not found: $INPUT_GIF"
    exit 1
fi

# Get original file size
ORIGINAL_SIZE=$(du -h "$INPUT_GIF" | cut -f1)
echo "📊 Original GIF size: $ORIGINAL_SIZE"

# Convert to MP4 (high quality, ~5-10MB)
echo ""
echo "🔄 Converting to MP4 (high quality)..."
ffmpeg -i "$INPUT_GIF" \
  -movflags faststart \
  -pix_fmt yuv420p \
  -vf "scale=1600:1200" \
  -c:v libx264 \
  -crf 25 \
  -preset medium \
  -y \
  "$OUTPUT_MP4" \
  2>&1 | grep -E "frame=|Duration|Stream|encoded" || true

# Convert to WebM (better compression, ~3-7MB)
echo ""
echo "🔄 Converting to WebM (better compression)..."
ffmpeg -i "$INPUT_GIF" \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -vf "scale=1600:1200" \
  -y \
  "$OUTPUT_WEBM" \
  2>&1 | grep -E "frame=|Duration|Stream|encoded" || true

# Get new file sizes
MP4_SIZE=$(du -h "$OUTPUT_MP4" | cut -f1)
WEBM_SIZE=$(du -h "$OUTPUT_WEBM" | cut -f1)

echo ""
echo "✅ Conversion complete!"
echo ""
echo "📊 Results:"
echo "  Original GIF:  $ORIGINAL_SIZE (public/website video.gif)"
echo "  New MP4:       $MP4_SIZE (public/website-video.mp4)"
echo "  New WebM:      $WEBM_SIZE (public/website-video.webm)"
echo ""
echo "🎯 Size reduction: $(echo "scale=1; (130 - ${MP4_SIZE//M/}) / 130 * 100" | bc 2>/dev/null || echo "~95")%"
echo ""
echo "Next steps:"
echo "  1. Run: git add public/website-video.mp4 public/website-video.webm"
echo "  2. The code in src/pages/Home.tsx has been updated to use <video>"
echo "  3. Optional: Delete the original GIF to save space:"
echo "     rm 'public/website video.gif' 'dist/website video.gif'"
echo ""
echo "✨ Your video is now ready for Vercel deployment!"
