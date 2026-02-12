```bash
# SSH into your Hostinger VPS
ssh root@<YOUR_VPS_IP>

# Navigate to your project
cd /path/to/benky-fy

# Install certbot (Hostinger VPS is usually Ubuntu)
apt update
apt install certbot -y

# Stop nginx container
docker compose stop nginx

# Get SSL certificate
certbot certonly --standalone -d srv1365980.hstgr.cloud --agree-tos --email your-email@example.com

# Switch to SSL nginx config
cp nginx/nginx-ssl.conf nginx/nginx.conf

# Edit docker-compose.yml - uncomment the SSL volume lines
nano docker-compose.yml
# Uncomment these lines:
#   - /etc/letsencrypt:/etc/letsencrypt:ro
#   - /var/www/certbot:/var/www/certbot:ro

# Add secure cookies to .env
echo "FORCE_SECURE_COOKIES=true" >> .env

# Restart everything
docker compose up -d

# Set up auto-renewal
crontab -e
# Add: 0 3 * * * certbot renew --quiet --post-hook "cd /path/to/benky-fy && docker compose restart nginx"
```