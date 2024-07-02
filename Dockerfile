# Use an official nginx image as the base image
FROM nginx:latest

# Copy the content of the build output directory to the nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]