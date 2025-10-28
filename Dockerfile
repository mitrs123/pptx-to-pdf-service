# Use Debian-based Node image so apt works
FROM node:18-bullseye-slim

# Install libreoffice (headless) and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-core libreoffice-writer libreoffice-impress libreoffice-common libreoffice-calc \
    fonts-dejavu-core \
    wget \
    unzip \
    fontconfig \
  && rm -rf /var/lib/apt/lists/*

# Install Lato font
RUN wget -q https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf \
    -O /usr/share/fonts/truetype/lato-regular.ttf \
  && wget -q https://github.com/google/fonts/raw/main/ofl/lato/Lato-Bold.ttf \
    -O /usr/share/fonts/truetype/lato-bold.ttf \
  && wget -q https://github.com/google/fonts/raw/main/ofl/lato/Lato-Italic.ttf \
    -O /usr/share/fonts/truetype/lato-italic.ttf \
  && wget -q https://github.com/google/fonts/raw/main/ofl/lato/Lato-BoldItalic.ttf \
    -O /usr/share/fonts/truetype/lato-bolditalic.ttf \
  && fc-cache -f -v

# Create app dir
WORKDIR /usr/src/app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install npm deps
RUN npm ci --only=production

# Copy source
COPY . .

# Ensure /tmp is available (Render provides /tmp)
ENV TMP_DIR=/tmp
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start
CMD ["node", "src/index.js"]

