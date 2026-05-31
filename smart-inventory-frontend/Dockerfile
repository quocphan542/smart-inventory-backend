# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
# NOTE: Set your React app environment variables here if needed
# ENV REACT_APP_API_URL=https://api.yourdomain.com/api
RUN npm run build

# Serve stage
FROM nginx:alpine
# Copy the built React app to Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html

# Replace default Nginx config with our custom one to support React Router
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
