#!/bin/sh

# This script creates a zip file suitable for extensions.gnome.org

# Dependencies:
# zip


echo "creating zip..."
zip -j onboardintegration\@simon.schumann.web.de src/*
echo "done."
