# Use the official Node.js image as the base
FROM node:18

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm-dev \
  libasound2 \
  libpangocairo-1.0-0 \
  libatspi2.0-0 \
  libgtk-3-0 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils \
  --no-install-recommends \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies (including Puppeteer)
RUN npm install

# Copy the application code into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]
