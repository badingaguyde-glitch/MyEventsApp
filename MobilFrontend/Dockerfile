# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json only (omitting package-lock.json to avoid host-specific lockfile issues)
COPY package.json ./

# Install dependencies (dynamically resolving optional dependencies for Alpine)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Metro Bundler port
EXPOSE 8081

# Command to run the application dev server
CMD ["npx", "expo", "start", "--tunnel"]
