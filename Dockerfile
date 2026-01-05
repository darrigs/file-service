# Use official Node.js LTS image (Alpine for smaller size)
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

# Use modern flag --omit=dev instead of deprecated --production
RUN npm install --omit=dev

# Copy app source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Switch to non-root user for security
USER node

# Expose port the app listens on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
