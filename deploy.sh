#!/bin/bash
# Quick deployment script for Quran Player

echo "🕌 Quran Player - Deployment Helper"
echo "===================================="
echo ""
echo "Choose deployment method:"
echo "1) Test locally (open in browser)"
echo "2) Deploy to GitHub Pages (requires git)"
echo "3) Deploy to Netlify (requires netlify-cli)"
echo "4) Deploy to VPS via SSH"
echo "5) Download all audio files for self-hosting"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "Opening in default browser..."
        if command -v xdg-open &> /dev/null; then
            xdg-open index.html
        elif command -v open &> /dev/null; then
            open index.html
        else
            echo "Please open index.html manually in your browser"
        fi
        ;;
    
    2)
        echo "GitHub Pages deployment"
        read -p "Enter your GitHub username: " username
        read -p "Enter repository name: " repo
        
        git init
        git add .
        git commit -m "Initial commit - Quran Player"
        git branch -M main
        git remote add origin "https://github.com/$username/$repo.git"
        
        echo ""
        echo "Now run:"
        echo "  git push -u origin main"
        echo ""
        echo "Then go to GitHub → Settings → Pages → Source: main branch"
        echo "Your site will be at: https://$username.github.io/$repo"
        ;;
    
    3)
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        echo "Deploying to Netlify..."
        netlify deploy --prod
        ;;
    
    4)
        echo "VPS Deployment"
        read -p "Enter VPS IP or hostname: " vps
        read -p "Enter SSH user: " user
        read -p "Enter remote path (default: /var/www/quran): " path
        path=${path:-/var/www/quran}
        
        echo "Uploading files..."
        ssh "$user@$vps" "sudo mkdir -p $path"
        scp -r index.html playlist-data.js player.js "$user@$vps:$path/"
        
        echo ""
        echo "Files uploaded to $path"
        echo "Don't forget to configure nginx/apache!"
        ;;
    
    5)
        echo "Downloading audio files..."
        mkdir -p audio
        cd audio
        
        echo "This will download ~1.4GB of audio files"
        read -p "Continue? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            # Download using the playlist data
            BASE="https://archive.org/download/01_20201211_20201211_0754/"
            
            # Sample - download first few files
            wget "${BASE}01%20%D8%B3%D9%88%D8%B1%D8%A9%20%D8%A7%D9%84%D9%81%D8%A7%D8%AA%D8%AD%D8%A9%20%D9%88%20%D8%A7%D9%84%D8%A8%D9%82%D8%B1%D8%A9.mp3"
            
            echo ""
            echo "✅ Sample downloaded. To download all, use a download manager or:"
            echo "   wget -i urls.txt"
            echo ""
            echo "After downloading all files, update playlist-data.js:"
            echo "   const BASE_URL = './audio/';"
        fi
        ;;
    
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
