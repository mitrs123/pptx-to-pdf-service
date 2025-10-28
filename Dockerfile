# Use Debian-based Node image so apt works
FROM node:18-bullseye-slim

# Install libreoffice (headless) and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-core libreoffice-writer libreoffice-impress libreoffice-common libreoffice-calc \
    fonts-dejavu-core \
    fonts-lato \
    fontconfig \
  && rm -rf /var/lib/apt/lists/*

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

