# Quick Setup Guide

## Test It Right Now (1 minute)

1. Open `index.html` in your browser
2. Click on any surah
3. Done! It streams from archive.org

## Deploy Online (5-10 minutes)

### Easiest: GitHub Pages (FREE)

```bash
# 1. Create repo on github.com, then:
cd quran-player
git init
git add .
git commit -m "Quran Player"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quran-player.git
git push -u origin main

# 2. Go to repo Settings → Pages → Source: main branch
# 3. Wait 1-2 minutes, site will be live!
```

Your URL: `https://YOUR_USERNAME.github.io/quran-player`

### Alternative: Netlify Drop (30 seconds)

1. Go to <https://app.netlify.com/drop>
2. Drag the entire `quran-player` folder
3. Done! You get instant URL

## VPS Setup (if you have one)

### Prerequisites
- VPS with Ubuntu/Debian
- Domain name (optional)
- SSH access

### Install Nginx

```bash
ssh user@your-vps-ip

sudo apt update
sudo apt install nginx -y
```

### Upload Files

On your local machine:
```bash
cd quran-player
scp -r * user@your-vps-ip:/tmp/quran/
```

On VPS:
```bash
sudo mkdir -p /var/www/quran
sudo mv /tmp/quran/* /var/www/quran/
sudo chown -R www-data:www-data /var/www/quran
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/quran
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or use your VPS IP
    
    root /var/www/quran;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;
    
    # Cache static files
    location ~* \.(html|css|js)$ {
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/quran /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Test: Open `http://your-vps-ip` in browser

### Add SSL (HTTPS) - Optional but recommended

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Customization

### Change Theme Colors

Edit `index.html`, find this line:
```css
background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
```

Try:
- Green theme: `#134E4A 0%, #065F46 100%`
- Purple theme: `#4C1D95 0%, #5B21B6 100%`
- Dark theme: `#111827 0%, #1F2937 100%`

### Add Download Buttons

In `index.html`, add after line with audio player:
```html
<button onclick="downloadAudio()">⬇️ تحميل</button>
```

In `player.js`, add:
```javascript
function downloadAudio() {
    const track = filteredPlaylist[currentIndex];
    const link = document.createElement('a');
    link.href = BASE_URL + track.file;
    link.download = track.title + '.mp3';
    link.click();
}
```

## Troubleshooting

**Audio doesn't play:**
- Check browser console (F12)
- Ensure archive.org is accessible
- Try different browser

**Search not working:**
- Use Arabic keyboard
- Try searching by number (1, 2, 3...)

**VPS nginx errors:**
```bash
sudo nginx -t              # Check config
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Want faster loading?**
- Self-host audio files (see README.md)
- Enable browser caching
- Use CDN (Cloudflare free plan)

## Next Steps

✅ Bookmark the page  
✅ Add to mobile home screen  
✅ Share with friends/family  
✅ Customize colors/theme  
✅ Add more features (see README)  

---

Need help? The files are simple HTML/CSS/JS - easy to modify and debug!
