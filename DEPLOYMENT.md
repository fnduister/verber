# 🚀 Verber Production Deployment Guide

This guide will help you deploy your Verber application to a production server using the automated deployment script.

## 📋 Prerequisites

### Server Requirements
- **Ubuntu 20.04+ LTS** (recommended)
- **2+ vCPUs, 4+ GB RAM** 
- **20+ GB storage**
- **Root/sudo access**
- **Public IP address**

### Domain Setup
- Domain name pointing to your server IP
- DNS A record: `yourdomain.com` → `your.server.ip`
- DNS A record: `www.yourdomain.com` → `your.server.ip`

## 🚀 Quick Deployment

### 1. Prepare Your Server
```bash
# Connect to your server
ssh root@your-server-ip

# Create a non-root user (recommended)
adduser deployer
usermod -aG sudo deployer
su - deployer
```

### 2. Upload Your Code
```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/verber.git /opt/verber
cd /opt/verber

# Make deployment script executable
chmod +x deploy.sh
```

### 3. Run Deployment Script
```bash
# Run the automated deployment
./deploy.sh
```

The script will ask you for:
- **Domain name** (e.g., `myverberapp.com`)
- **Email address** (for SSL certificate)
- **Database password** (secure, 20+ characters)
- **JWT secret** (secure, 64+ characters)

### 4. Wait for Completion
The deployment script will automatically:
- ✅ Install Docker & dependencies
- ✅ Configure firewall
- ✅ Build and start your application
- ✅ Setup Nginx reverse proxy
- ✅ Install SSL certificate
- ✅ Create management scripts
- ✅ Setup automated backups

## 🔧 Post-Deployment Management

### Daily Operations
```bash
# Check application status
/opt/verber/monitor.sh

# View application logs
cd /opt/verber && docker-compose -f docker-compose.prod.yml logs -f

# Create manual backup
/opt/verber/backup.sh

# Update application
/opt/verber/update.sh
```

### Troubleshooting
```bash
# Check container status
cd /opt/verber
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart backend

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates

# View detailed logs
docker logs verber-frontend-prod
docker logs verber-backend-prod
docker logs verber-postgres-prod
```

## 🔒 Security Features

### Automatic Security Setup
- ✅ UFW firewall (only SSH, HTTP, HTTPS open)
- ✅ SSL/HTTPS with Let's Encrypt
- ✅ Secure database credentials
- ✅ JWT token security
- ✅ Nginx security headers

### Backup & Recovery
- ✅ Daily automated database backups (2:00 AM)
- ✅ 7-day backup retention
- ✅ Manual backup script available

## 📊 Monitoring

### Health Checks
```bash
# Quick status check
/opt/verber/monitor.sh

# Detailed Docker stats
docker stats

# System resources
htop
df -h
free -h
```

### Log Locations
- **Application**: `docker-compose logs`
- **Nginx**: `/var/log/nginx/`
- **SSL**: `/var/log/letsencrypt/`
- **System**: `journalctl -u docker`

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update application code
/opt/verber/update.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd /opt/verber
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Scaling Considerations
- **Database**: Consider managed PostgreSQL for high traffic
- **File Storage**: Consider object storage for user uploads
- **Load Balancing**: Add load balancer for multiple instances
- **CDN**: Add CloudFlare or similar for static assets

## 🆘 Emergency Procedures

### Application Down
```bash
# Check all services
cd /opt/verber
docker-compose -f docker-compose.prod.yml ps

# Restart all services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs
```

### Database Issues
```bash
# Access database directly
docker exec -it verber-postgres-prod psql -U verber_user verber_db

# Restore from backup
cd /opt/verber-backups
gunzip verber_backup_YYYYMMDD_HHMMSS.sql.gz
docker exec -i verber-postgres-prod psql -U verber_user verber_db < verber_backup_YYYYMMDD_HHMMSS.sql
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Reconfigure Nginx + SSL
sudo certbot --nginx -d yourdomain.com
```

## 🌟 Performance Optimization

### Production Tuning
1. **Database**: Tune PostgreSQL settings for your workload
2. **Redis**: Configure memory limits and eviction policies
3. **Nginx**: Enable caching for static assets
4. **Docker**: Limit container resources if needed

### Monitoring Tools
- **Server**: Consider Netdata, Grafana, or New Relic
- **Application**: Add application performance monitoring
- **Uptime**: Use UptimeRobot or similar service
- **Logs**: Consider ELK stack or similar for log aggregation

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Check server resources (CPU, memory, disk)
4. Verify DNS and SSL configuration
5. Test database connectivity

## 🎉 Success!

Once deployed, your Verber application will be available at:
- **Production URL**: `https://yourdomain.com`
- **Admin Interface**: Access via your application's admin panel
- **Database**: Managed automatically via Docker
- **SSL**: Automatic renewal every 60 days

Your application is now production-ready with:
- ✅ High availability setup
- ✅ Automatic backups
- ✅ SSL security
- ✅ Performance optimization
- ✅ Easy management tools

Happy verb learning! 🎓📚