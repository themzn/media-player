let currentIndex = -1;
let filteredPlaylist = [...playlist];
let favorites = new Set();
let showingFavoritesOnly = false;
let currentSpeed = 1.15;

// Get DOM elements
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const currentTitle = document.getElementById('currentTitle');
const currentNumber = document.getElementById('currentNumber');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const skipBackwardBtn = document.getElementById('skipBackwardBtn');
const skipForwardBtn = document.getElementById('skipForwardBtn');
const themeToggle = document.getElementById('themeToggle');
const favoritesFilter = document.getElementById('favoritesFilter');
const speedButtons = document.querySelectorAll('.speed-btn');

// Theme management
function initTheme() {
    try {
        const savedTheme = localStorage.getItem('quran_player_theme') || 'light';
        console.log('Initializing theme:', savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } catch (err) {
        console.error('Error initializing theme:', err);
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon('light');
    }
}

function toggleTheme(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme from', currentTheme, 'to', newTheme);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quran_player_theme', newTheme);
        updateThemeIcon(newTheme);
    } catch (err) {
        console.error('Error toggling theme:', err);
    }
    
    return false;
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري');
}

// Favorites management
function loadFavorites() {
    try {
        const saved = localStorage.getItem('quran_favorites');
        if (saved) {
            favorites = new Set(JSON.parse(saved));
        }
    } catch (err) {
        console.error('Error loading favorites:', err);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('quran_favorites', JSON.stringify([...favorites]));
    } catch (err) {
        console.error('Error saving favorites:', err);
    }
}

function toggleFavorite(number, event) {
    event.stopPropagation();
    
    if (favorites.has(number)) {
        favorites.delete(number);
    } else {
        favorites.add(number);
    }
    
    saveFavorites();
    renderPlaylist();
}

function filterFavorites() {
    showingFavoritesOnly = !showingFavoritesOnly;
    
    if (showingFavoritesOnly) {
        filteredPlaylist = playlist.filter(item => favorites.has(item.number));
        favoritesFilter.classList.add('active');
    } else {
        filteredPlaylist = [...playlist];
        favoritesFilter.classList.remove('active');
    }
    
    currentIndex = -1;
    renderPlaylist();
}

// Initialize playlist UI
function renderPlaylist() {
    playlistEl.innerHTML = '';
    filteredPlaylist.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        if (currentIndex === index) {
            div.classList.add('active');
        }
        
        const isFavorite = favorites.has(item.number);
        const starIcon = isFavorite ? '⭐' : '☆';
        
        div.innerHTML = `
            <div class="title-wrapper">
                <span class="star" data-number="${item.number}">${starIcon}</span>
                <span>${item.title}</span>
            </div>
            <span class="number">${item.number}</span>
        `;
        
        // Click on title/number to play
        div.onclick = (e) => {
            if (!e.target.classList.contains('star')) {
                loadTrack(index);
            }
        };
        
        // Click on star to toggle favorite
        const starEl = div.querySelector('.star');
        starEl.onclick = (e) => toggleFavorite(item.number, e);
        
        playlistEl.appendChild(div);
    });
}

// Load a track
function loadTrack(index) {
    if (index < 0 || index >= filteredPlaylist.length) return;
    
    const track = filteredPlaylist[index];
    currentIndex = index;
    
    audioSource.src = BASE_URL + track.file;
    audioPlayer.load();
    audioPlayer.playbackRate = currentSpeed; // Apply saved speed
    
    currentTitle.textContent = track.title;
    currentNumber.textContent = `المقطع ${track.number}`;
    
    renderPlaylist();
    
    // Auto play
    audioPlayer.play().catch(err => {
        console.log('Auto-play prevented:', err);
    });
    
    updatePlayPauseButton();
}

// Previous track
function prevTrack() {
    if (currentIndex > 0) {
        loadTrack(currentIndex - 1);
    }
}

// Next track
function nextTrack() {
    if (currentIndex < filteredPlaylist.length - 1) {
        loadTrack(currentIndex + 1);
    }
}

// Play/Pause toggle
function togglePlayPause() {
    if (currentIndex === -1) {
        loadTrack(0);
    } else if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    if (audioPlayer.paused) {
        playPauseBtn.textContent = '▶️ تشغيل';
    } else {
        playPauseBtn.textContent = '⏸️ إيقاف';
    }
}

// Skip forward/backward 30 seconds
function skipBackward() {
    if (audioPlayer.currentTime > 30) {
        audioPlayer.currentTime -= 30;
    } else {
        audioPlayer.currentTime = 0;
    }
}

function skipForward() {
    if (audioPlayer.currentTime + 30 < audioPlayer.duration) {
        audioPlayer.currentTime += 30;
    } else {
        audioPlayer.currentTime = audioPlayer.duration;
    }
}

// Speed control
function loadSpeed() {
    try {
        const saved = localStorage.getItem('quran_playback_speed');
        if (saved) {
            currentSpeed = parseFloat(saved);
            setSpeed(currentSpeed);
        }
    } catch (err) {
        console.error('Error loading speed:', err);
    }
}

function setSpeed(speed) {
    currentSpeed = speed;
    audioPlayer.playbackRate = speed;
    localStorage.setItem('quran_playback_speed', speed.toString());
    
    // Update active button
    speedButtons.forEach(btn => {
        if (parseFloat(btn.dataset.speed) === speed) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    
    let baseList = showingFavoritesOnly 
        ? playlist.filter(item => favorites.has(item.number))
        : [...playlist];
    
    if (searchTerm === '') {
        filteredPlaylist = baseList;
    } else {
        filteredPlaylist = baseList.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.number.toString().includes(searchTerm)
        );
    }
    
    currentIndex = -1;
    renderPlaylist();
});

// Auto-play next track when current ends
audioPlayer.addEventListener('ended', () => {
    nextTrack();
});

// Update play/pause button when playback state changes
audioPlayer.addEventListener('play', updatePlayPauseButton);
audioPlayer.addEventListener('pause', updatePlayPauseButton);

// Button events
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
playPauseBtn.addEventListener('click', togglePlayPause);
skipBackwardBtn.addEventListener('click', skipBackward);
skipForwardBtn.addEventListener('click', skipForward);

// Speed control events
speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        setSpeed(speed);
    });
});

// Favorites filter event
favoritesFilter.addEventListener('click', filterFavorites);

// Theme toggle with better mobile support
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleTheme(e);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
        skipBackward();
    } else if (e.code === 'ArrowRight') {
        skipForward();
    } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        prevTrack();
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        nextTrack();
    }
});

// Save/restore playback position
audioPlayer.addEventListener('timeupdate', () => {
    if (currentIndex >= 0) {
        localStorage.setItem('quran_player_state', JSON.stringify({
            index: currentIndex,
            time: audioPlayer.currentTime
        }));
    }
});

// Restore last position on load
window.addEventListener('load', () => {
    const savedState = localStorage.getItem('quran_player_state');
    if (savedState) {
        try {
            const { index, time } = JSON.parse(savedState);
            loadTrack(index);
            audioPlayer.currentTime = time;
            audioPlayer.pause();
        } catch (err) {
            console.log('Could not restore state:', err);
        }
    }
});

// PWA Installation
let deferredPrompt;
const installPromptEl = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const closeInstallPrompt = document.getElementById('closeInstallPrompt');
const offlineIndicator = document.getElementById('offlineIndicator');

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/media-player/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Capture install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Check if user hasn't dismissed it before
    const dismissed = localStorage.getItem('install_prompt_dismissed');
    if (!dismissed) {
        setTimeout(() => {
            installPromptEl.classList.add('show');
        }, 3000); // Show after 3 seconds
    }
});

// Install button click
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);
        
        deferredPrompt = null;
        installPromptEl.classList.remove('show');
    });
}

// Close install prompt
if (closeInstallPrompt) {
    closeInstallPrompt.addEventListener('click', () => {
        installPromptEl.classList.remove('show');
        localStorage.setItem('install_prompt_dismissed', 'true');
    });
}

// Detect when app is installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installPromptEl.classList.remove('show');
});

// Online/Offline detection
function updateOnlineStatus() {
    if (!navigator.onLine) {
        offlineIndicator.classList.add('show');
    } else {
        offlineIndicator.classList.remove('show');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Initialize theme, favorites, speed, and playlist
initTheme();
loadFavorites();
loadSpeed();
renderPlaylist();
