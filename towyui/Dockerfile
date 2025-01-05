FROM node:18-alpine
    
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy project files
    COPY . .
    
    # Build the app
    RUN npm run build
    
    # Expose port
    EXPOSE 3000
    
    # Start command
    CMD ["npm", "start"]

    