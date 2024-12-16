# Use the official Node.js image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies (production-only for a hosting server)
RUN npm install --only=production

# Copy the application code into the container
COPY . .

# Expose the application port (adjust if your app listens on a different port)
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]
