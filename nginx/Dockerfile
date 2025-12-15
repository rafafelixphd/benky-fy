# Nginx Reverse Proxy for Benky-Fy
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Expose ports
EXPOSE 80 443

# Use default nginx entrypoint
CMD ["nginx", "-g", "daemon off;"]
