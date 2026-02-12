# HTTPS/SSL Setup Guide for Benky-Fy

## Prerequisites
- Domain pointing to your VPS IP (srv1365980.hstgr.cloud)
- Ports 80 and 443 open in firewall
- Docker containers running

## Step 1: Install Certbot on VPS

SSH into your VPS and install certbot:

```bash
ssh your-user@srv1365980.hstgr.cloud

# For Ubuntu/Debian
sudo apt update
sudo apt install certbot -y
```

## Step 2: Stop nginx container temporarily

```bash
cd /path/to/benky-fy
docker compose stop nginx
```

## Step 3: Get SSL Certificate

Run certbot in standalone mode (it will use port 80):

```bash
sudo certbot certonly --standalone -d srv1365980.hstgr.cloud
```

Follow the prompts:
- Enter your email
- Agree to terms
- Optionally share email with EFF

Certificates will be saved to:
- `/etc/letsencrypt/live/srv1365980.hstgr.cloud/fullchain.pem`
- `/etc/letsencrypt/live/srv1365980.hstgr.cloud/privkey.pem`

## Step 4: Update nginx configuration

On your VPS, replace the nginx config with the SSL version:

```bash
cd /path/to/benky-fy
cp nginx/nginx-ssl.conf nginx/nginx.conf
```

## Step 5: Update docker-compose.yml

Uncomment the SSL certificate volume mounts:

```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/conf.d/nginx.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro  # Uncomment this
  - /var/www/certbot:/var/www/certbot:ro  # Uncomment this
```

## Step 6: Update backend session config

Now that you have HTTPS, enable secure cookies:

In your `.env` file on the VPS, add:
```bash
FORCE_SECURE_COOKIES=true
```

## Step 7: Restart containers

```bash
docker compose up -d
```

## Step 8: Test HTTPS

Visit: `https://srv1365980.hstgr.cloud`

You should see:
- ✅ Padlock icon in browser
- ✅ HTTP automatically redirects to HTTPS
- ✅ Login works with secure cookies

## Step 9: Set up auto-renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line (runs twice daily):
0 0,12 * * * certbot renew --quiet --post-hook "docker compose -f /path/to/benky-fy/docker-compose.yml restart nginx"
```

## Troubleshooting

### Certificate not found error
- Make sure certbot ran successfully
- Check certificates exist: `sudo ls -la /etc/letsencrypt/live/srv1365980.hstgr.cloud/`
- Verify volume mounts are uncommented in docker-compose.yml

### nginx won't start
- Check nginx logs: `docker logs benky-fy-nginx`
- Verify domain name in nginx-ssl.conf matches your certificate
- Test nginx config: `docker exec benky-fy-nginx nginx -t`

### HTTP still works (not redirecting)
- Verify you're using nginx-ssl.conf (not the old nginx.conf)
- Restart nginx: `docker compose restart nginx`

## Security Notes

- Certificates auto-renew every 60 days (before 90-day expiration)
- HTTPS uses TLS 1.2 and 1.3 (secure protocols)
- HSTS header forces HTTPS for 1 year
- Session cookies now use Secure flag (HTTPS only)
