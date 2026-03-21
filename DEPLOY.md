# BrewPass — VPS Deployment Guide

## Requirements
- Ubuntu 20.04+ VPS (2GB RAM minimum)
- Node.js 20+
- PostgreSQL 14+
- Nginx
- PM2

---

## Step 1 — Install system dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

---

## Step 2 — Set up PostgreSQL

```bash
sudo -u postgres psql

# Inside psql:
CREATE USER brewpass WITH PASSWORD 'choose_strong_password_here';
CREATE DATABASE brewpass OWNER brewpass;
GRANT ALL PRIVILEGES ON DATABASE brewpass TO brewpass;
\q
```

---

## Step 3 — Upload and configure the app

```bash
# Create app directory
sudo mkdir -p /var/www/brewpass
sudo chown $USER:$USER /var/www/brewpass

# Upload brewpass_vps.zip to /var/www/brewpass, then:
cd /var/www/brewpass
unzip brewpass_vps.zip
cd brewpass_final

# Create .env from template
cp .env.production .env
nano .env   # Fill in all values
```

**Fill in `.env`:**
```env
DATABASE_URL="postgresql://brewpass:your_password@localhost:5432/brewpass"
JWT_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
ADMIN_PIN="choose-a-secure-pin"
```

---

## Step 4 — Install dependencies and build

```bash
cd /var/www/brewpass/brewpass_final

npm install
npx prisma generate
npx prisma db push
npm run build
```

---

## Step 5 — Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # Follow the printed command to auto-start on reboot
```

Check it's running:
```bash
pm2 status
pm2 logs brewpass
```

---

## Step 6 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/brewpass
```

Paste this (replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Max upload size for logo images
    client_max_body_size 5M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/brewpass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7 — SSL with Let's Encrypt (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts — auto-renews every 90 days
```

---

## Step 8 — Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Maintenance commands

```bash
# View logs
pm2 logs brewpass

# Restart app
pm2 restart brewpass

# Deploy update
cd /var/www/brewpass/brewpass_final
git pull   # or re-upload files
npm install
npx prisma db push
npm run build
pm2 restart brewpass

# Database backup
pg_dump -U brewpass brewpass > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U brewpass brewpass < backup_20240101.sql
```

---

## Verify everything works

- [ ] `https://yourdomain.com` — landing page loads
- [ ] `https://yourdomain.com/register` — can register a shop
- [ ] `https://yourdomain.com/login` — can log in
- [ ] `https://yourdomain.com/dashboard` — dashboard loads
- [ ] `https://yourdomain.com/dashboard/approvals` — approvals load
- [ ] `https://yourdomain.com/admin` — admin panel loads (enter PIN)
- [ ] Scan a QR code on your phone — scan page loads and works

---

## If using a raw IP (no domain)

Update `.env`:
```env
NEXT_PUBLIC_APP_URL="http://YOUR_VPS_IP"
```

And Nginx config:
```nginx
server_name YOUR_VPS_IP;
```

Note: SSL requires a domain name. Without SSL, browsers may warn about insecure connection.
