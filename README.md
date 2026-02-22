# Quran Player - مشغل القرآن الكريم

A modern, clean web-based Quran player with a better UI than archive.org

## Features

✅ Modern, responsive design  
✅ Full playlist (86 audio files)  
✅ Search functionality (Arabic)  
✅ Keyboard shortcuts (Space, Arrow keys)  
✅ Auto-play next surah  
✅ Remembers last position  
✅ Mobile-friendly  
✅ No dependencies - pure HTML/CSS/JS  

## Quick Test Locally

Just open `index.html` in your browser. That's it!

## Deployment Options

### Option 1: GitHub Pages (FREE, easiest)

1. Create a new GitHub repo
2. Upload these 4 files:
   - index.html
   - playlist-data.js
   - player.js
   - README.md
3. Go to Settings → Pages → Source: main branch
4. Your site will be live at: `https://yourusername.github.io/repo-name`

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/quran-player.git
git push -u origin main
```

### Option 2: Netlify/Vercel (FREE, instant)

**Netlify:**
1. Drag and drop the `quran-player` folder to netlify.com/drop
2. Done! You get a URL like `your-site.netlify.app`

**Vercel:**
```bash
npm i -g vercel
cd quran-player
vercel
```

### Option 3: Your Own VPS (Full control)

**Requirements:**
- VPS with nginx/apache
- Domain name (optional)

**Setup with Nginx:**

```bash
# 1. SSH into your VPS
ssh user@your-vps-ip

# 2. Install nginx
sudo apt update
sudo apt install nginx -y

# 3. Upload files
# On your local machine:
scp -r quran-player user@your-vps-ip:/var/www/

# 4. Create nginx config
sudo nano /etc/nginx/sites-available/quran
```

Paste this config:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP
    
    root /var/www/quran-player;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache audio files
    location ~* \.(mp3)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/quran /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Optional: Add SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 4: Self-host the Audio Files

Currently, audio streams from archive.org. To self-host:

1. Download all files:
```bash
cd quran-player
mkdir audio
cd audio

# Download script
for i in {1..86}; do
    wget "https://archive.org/download/01_20201211_20201211_0754/FILE_URL_HERE"
done
```

2. Update `playlist-data.js`:
```javascript
const BASE_URL = "./audio/";  // Change from archive.org URL
```

3. Total size: ~1.4GB (make sure your hosting has enough space)

## Customization

**Change Colors:**
Edit the CSS gradient in `index.html`:
```css
background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
```

**Add Features:**
- Download button
- Speed control
- Loop single surah
- Favorites list
- Dark/light theme toggle

## Keyboard Shortcuts

- `Space` - Play/Pause
- `←` - Next track
- `→` - Previous track

## Browser Compatibility

✅ Chrome/Edge (recommended)  
✅ Firefox  
✅ Safari  
✅ Mobile browsers  

## License

Free to use and modify. Audio content from archive.org.

---

**Made with care for a better Quran listening experience** 🕌
