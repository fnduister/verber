# 🚀 Automated Deployment Guide

This guide covers multiple ways to automatically deploy your Verber application when changes are pushed to a remote branch.

## 📋 Table of Contents

1. [GitHub Actions (Recommended)](#github-actions)
2. [Webhook Deployment](#webhook-deployment)
3. [Git Hooks](#git-hooks)
4. [Manual Deployment](#manual-deployment)
5. [Environment Setup](#environment-setup)

---

## 🔧 GitHub Actions (Recommended)

### Setup Steps

1. **Configure Repository Secrets**
   Go to your GitHub repository → Settings → Secrets and Variables → Actions

   Add these secrets:

   ```
   DOCKER_USERNAME=your-docker-hub-username
   DOCKER_PASSWORD=your-docker-hub-password
   SERVER_HOST=your-server-ip-or-domain
   SERVER_USER=your-server-username
   SERVER_SSH_KEY=your-private-ssh-key
   SERVER_PORT=22 (optional, defaults to 22)
   DISCORD_WEBHOOK=your-discord-webhook-url (optional)
   ```

2. **SSH Key Setup**

   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -C "deployment@verber"

   # Copy public key to server
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server

   # Copy private key content to GitHub secret SERVER_SSH_KEY
   cat ~/.ssh/id_ed25519
   ```

3. **Server Preparation**

   ```bash
   # On your server
   sudo mkdir -p /opt/verber
   cd /opt/verber
   git clone https://github.com/your-username/verber.git .

   # Set environment variables
   sudo tee /opt/verber/.env << EOF
   VERBER_DOMAIN=your-domain.com
   VERBER_EMAIL=your-email@domain.com
   VERBER_DB_PASSWORD=your-secure-db-password
   VERBER_JWT_SECRET=your-jwt-secret-64-chars-long
   EOF

   # Make scripts executable
   chmod +x deploy.sh manage.sh
   ```

4. **Trigger Deployment**
   ```bash
   # Push to main or production branch
   git push origin main
   ```

### Workflow Features

- ✅ Automatic deployment on push to `main` or `production` branches
- ✅ Build and test before deployment
- ✅ Zero-downtime deployment with health checks
- ✅ Automatic rollback on failure
- ✅ Discord/Slack notifications
- ✅ Manual trigger option

---

## 🎣 Webhook Deployment

### Setup Webhook Handler

1. **Install Dependencies on Server**

   ```bash
   sudo apt update
   sudo apt install -y jq curl openssl
   ```

2. **Setup Webhook Script**

   ```bash
   # Copy webhook-deploy.sh to your server
   sudo cp webhook-deploy.sh /opt/verber/
   sudo chmod +x /opt/verber/webhook-deploy.sh

   # Set environment variables
   export WEBHOOK_SECRET="your-webhook-secret-here"
   export DEPLOY_BRANCH="main"
   export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." # Optional
   ```

3. **Setup Web Server (Nginx)**

   ```bash
   sudo tee /etc/nginx/sites-available/webhook << EOF
   server {
       listen 8080;
       server_name your-domain.com;

       location /webhook {
           proxy_pass http://127.0.0.1:9000/webhook;
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
           proxy_set_header X-Hub-Signature-256 \$http_x_hub_signature_256;
       }
   }
   EOF

   sudo ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **Setup Webhook Service**

   ```bash
   # Install webhook handler
   sudo npm install -g webhook

   # Create webhook configuration
   sudo tee /opt/verber/hooks.json << EOF
   [
     {
       "id": "verber-deploy",
       "execute-command": "/opt/verber/webhook-deploy.sh",
       "command-working-directory": "/opt/verber",
       "pass-environment-to-command": [
         {
           "source": "header",
           "name": "X-Hub-Signature-256"
         }
       ]
     }
   ]
   EOF

   # Create systemd service
   sudo tee /etc/systemd/system/verber-webhook.service << EOF
   [Unit]
   Description=Verber Webhook Handler
   After=network.target

   [Service]
   Type=simple
   User=webhook
   WorkingDirectory=/opt/verber
   ExecStart=/usr/local/bin/webhook -hooks /opt/verber/hooks.json -port 9000
   Restart=always
   Environment=WEBHOOK_SECRET=your-webhook-secret-here
   Environment=DEPLOY_BRANCH=main

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl daemon-reload
   sudo systemctl enable verber-webhook
   sudo systemctl start verber-webhook
   ```

5. **Configure GitHub Webhook**
   - Go to your repository → Settings → Webhooks
   - Add webhook:
     - URL: `https://your-domain.com:8080/webhook/verber-deploy`
     - Content type: `application/json`
     - Secret: `your-webhook-secret-here`
     - Events: `push`

### Test Webhook

```bash
# Test deployment
/opt/verber/webhook-deploy.sh test main

# Check webhook logs
sudo journalctl -u verber-webhook -f
```

---

## 🔗 Git Hooks

### Setup Post-Receive Hook

1. **Create Bare Repository on Server**

   ```bash
   # On your server
   sudo mkdir -p /opt/git/verber.git
   cd /opt/git/verber.git
   git init --bare

   # Setup post-receive hook
   sudo cp /opt/verber/git-hook-deploy.sh hooks/post-receive
   sudo chmod +x hooks/post-receive
   ```

2. **Add Remote to Local Repository**

   ```bash
   # On your local machine
   git remote add deploy user@your-server:/opt/git/verber.git
   ```

3. **Deploy by Pushing**
   ```bash
   git push deploy main
   ```

### Setup Work Tree (Alternative)

```bash
# On server - setup work tree
cd /opt/git/verber.git
git worktree add /opt/verber main

# The deployment directory will be updated automatically
```

---

## 💻 Manual Deployment

### Quick Deploy Command

```bash
# On your server
cd /opt/verber
git pull origin main
./deploy.sh --auto-deploy
```

### With Custom Configuration

```bash
# Set environment variables
export VERBER_DOMAIN="your-domain.com"
export VERBER_EMAIL="you@domain.com"
export VERBER_DB_PASSWORD="secure-password"
export VERBER_JWT_SECRET="very-long-jwt-secret"

# Deploy
./deploy.sh --skip-interactive
```

---

## 🌍 Environment Setup

### Required Environment Variables

Create `/opt/verber/.env`:

```bash
# Domain and SSL
VERBER_DOMAIN=your-domain.com
VERBER_EMAIL=your-email@domain.com

# Database
VERBER_DB_PASSWORD=your-secure-db-password-20-chars-min
POSTGRES_USER=verber_user
POSTGRES_PASSWORD=your-secure-db-password-20-chars-min
POSTGRES_DB=verber_db

# Application
VERBER_JWT_SECRET=your-jwt-secret-must-be-64-characters-long-for-security
JWT_SECRET=your-jwt-secret-must-be-64-characters-long-for-security
NODE_ENV=production
GO_ENV=production

# Optional - Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional - Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### Load Environment Variables

```bash
# Load into current session
source /opt/verber/.env

# Or load in deploy script
export $(cat /opt/verber/.env | xargs)
```

---

## 🔐 Security Considerations

### SSH Key Security

```bash
# Use ed25519 keys (more secure)
ssh-keygen -t ed25519 -C "deployment"

# Restrict SSH key usage (in authorized_keys)
command="/opt/verber/deploy.sh --auto-deploy",no-port-forwarding,no-x11-forwarding ssh-ed25519 AAAA...
```

### Firewall Setup

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Webhook (optional)
sudo ufw enable
```

### Secret Management

- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use strong, unique passwords
- Enable 2FA on all accounts

---

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   sudo chown -R $USER:$USER /opt/verber
   chmod +x /opt/verber/*.sh
   ```

2. **Docker Build Fails**

   ```bash
   # Check Docker daemon
   sudo systemctl status docker

   # Clean up Docker
   docker system prune -f
   ```

3. **Health Check Fails**

   ```bash
   # Check application logs
   ./manage.sh logs

   # Check service status
   ./manage.sh status
   ```

4. **SSL Certificate Issues**

   ```bash
   # Renew certificate
   sudo certbot renew

   # Check certificate status
   ./manage.sh ssl-status
   ```

### Logs Location

- Deployment logs: `/var/log/verber-deploy.log`
- Application logs: `docker-compose logs`
- Webhook logs: `sudo journalctl -u verber-webhook`

---

## 📞 Support Commands

```bash
# Check deployment status
./manage.sh status

# View logs
./manage.sh logs

# Create backup
./manage.sh backup

# Restore from backup
./manage.sh restore-latest

# Update SSL certificate
./manage.sh ssl-renew

# Test deployment
./webhook-deploy.sh test main
```

---

## 🎯 Best Practices

1. **Always test in staging first**
2. **Use feature branches for development**
3. **Tag releases for production deployments**
4. **Monitor application health**
5. **Keep backups of database and configuration**
6. **Use environment-specific configuration files**
7. **Implement proper logging and monitoring**
8. **Regular security updates**

---

Happy Deploying! 🚀
