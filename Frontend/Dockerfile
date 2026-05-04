# Stage 1: Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Nginx server
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i 's/\r$//' /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]