#!/bin/bash



# Use like this:
# bash get-dominant-color-from-image.sh https://res.cloudinary.com/urre/image/upload/v1520179316/nils-janson-alloy_qgaevn_ipc8vj.jpg ../src/pages/alloy.md
# bash get-dominant-color-from-image.sh https://res.cloudinary.com/urre/image/upload/q_auto,f_auto,w_500,h_500/v1727331308/yk50dluswzuruucl5ayn.jpg ../src/pages/fire-øjne.md




# Check if both arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <image-url> <markdown-file>"
  exit 1
fi

IMAGE_URL="$1"
MARKDOWN_FILE="$2"
TEMP_IMAGE="/tmp/temp_image.jpg"

# Check if the markdown file exists
if [ ! -f "$MARKDOWN_FILE" ]; then
  echo "Error: Markdown file '$MARKDOWN_FILE' not found!"
  exit 1
fi

# Download the image using curl
echo "Downloading image..."
curl -s "$IMAGE_URL" --output "$TEMP_IMAGE"

# Check if the image was downloaded successfully
if [ ! -f "$TEMP_IMAGE" ]; then
  echo "Error: Unable to download the image!"
  exit 1
fi

echo "Image downloaded successfully."

# Extract dominant colors and convert to hex, limit to top 3
COLORS=$(magick "$TEMP_IMAGE" -resize 100x100 -format %c -depth 8 histogram:info:- | \
  sort -nr | \
  head -n 3 | \
  grep -oE '#[0-9A-Fa-f]{6}')

# Check if any colors were found
if [ -z "$COLORS" ]; then
  echo "Error: No colors could be extracted."
  exit 1
fi

# Prepare the YAML content with quotes around the colors
YAML_CONTENT="colors:\n"
for color in $COLORS; do
  YAML_CONTENT+="  - \"$color\"\n"  # Adding quotes around the color
done

# Insert the YAML content after the line containing pubDate
echo "Inserting YAML after pubDate in $MARKDOWN_FILE..."

# Use a temporary file to modify the original markdown file
{
  # Read through the file line by line
  while IFS= read -r line; do
    echo "$line"  # Output the current line
    # Check if the current line contains pubDate and append YAML after it
    if [[ $line == pubDate:* ]]; then
      echo -e "$YAML_CONTENT"  # Insert the YAML content
    fi
  done < "$MARKDOWN_FILE"
} > /tmp/temp_markdown.md && mv /tmp/temp_markdown.md "$MARKDOWN_FILE"

# Clean up the temporary image file
rm -f "$TEMP_IMAGE"

echo "YAML inserted successfully after pubDate in $MARKDOWN_FILE."
