# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
