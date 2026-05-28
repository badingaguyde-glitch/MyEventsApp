# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Metro Bundler port
EXPOSE 8081

# Command to run the application dev server
CMD ["npx", "expo", "start", "--tunnel"]
