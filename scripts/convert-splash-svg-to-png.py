#!/usr/bin/env python3

"""
convert-splash-svg-to-png.py

Converts splash-template.svg to PNG format for Expo splash screen.

Usage:
  python3 scripts/convert-splash-svg-to-png.py

Requires: PIL/Pillow, cairosvg, or built-in tools
"""

import os
import sys
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
ASSETS_DIR = PROJECT_ROOT / 'assets' / 'images'
SVG_FILE = ASSETS_DIR / 'splash-template.svg'
PNG_FILE = ASSETS_DIR / 'splash.png'

def convert_with_imagemagick():
    """Convert SVG to PNG using ImageMagick's 'convert' command."""
    try:
        cmd = [
            'convert',
            '-background', 'none',
            '-density', '150',
            str(SVG_FILE),
            '-resize', '512x512',
            str(PNG_FILE)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except FileNotFoundError:
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ ImageMagick conversion failed: {e.stderr.decode()}")
        return False

def convert_with_cairosvg():
    """Convert SVG to PNG using cairosvg library."""
    try:
        import cairosvg
        cairosvg.svg2png(
            url=str(SVG_FILE),
            write_to=str(PNG_FILE),
            output_width=512,
            output_height=512
        )
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"❌ cairosvg conversion failed: {e}")
        return False

def convert_with_skia():
    """Convert SVG to PNG using Skia (via canvaskit or similar)."""
    try:
        import skia
        # This would require more complex setup
        print("⚠️  Skia conversion not yet implemented")
        return False
    except ImportError:
        return False

def main():
    print("🎨 Converting Vela splash SVG to PNG...\n")

    # Check if SVG exists
    if not SVG_FILE.exists():
        print(f"❌ SVG file not found: {SVG_FILE}")
        sys.exit(1)

    print(f"📄 Source: {SVG_FILE}")
    print(f"📸 Target: {PNG_FILE}")
    print(f"📐 Size: 512×512 pixels\n")

    # Try different conversion methods
    methods = [
        ("ImageMagick (convert)", convert_with_imagemagick),
        ("Cairo SVG", convert_with_cairosvg),
        ("Skia", convert_with_skia),
    ]

    for method_name, method_func in methods:
        print(f"🔄 Trying {method_name}...")
        if method_func():
            file_size = PNG_FILE.stat().st_size / 1024
            print(f"✅ {method_name} conversion successful!")
            print(f"   File: {PNG_FILE}")
            print(f"   Size: {file_size:.1f} KB\n")
            return

    # If no method worked
    print("\n❌ Could not convert SVG to PNG. Please install one of:")
    print("   1. ImageMagick: brew install imagemagick")
    print("   2. cairosvg: pip install cairosvg")
    print("\nAlternatively, convert splash-template.svg manually:")
    print("   - Online: https://convertio.co/svg-png/")
    print("   - Figma: Import SVG, export as PNG 512×512")
    print("   - Sketch: File → Export → PNG")
    sys.exit(1)

if __name__ == '__main__':
    main()
