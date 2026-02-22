let currentIndex = -1;
let filteredPlaylist = [...playlist];

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
const themeToggle = document.getElementById('themeToggle');

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

// Initialize playlist UI
function renderPlaylist() {
    playlistEl.innerHTML = '';
    filteredPlaylist.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        if (currentIndex === index) {
            div.classList.add('active');
        }
        div.innerHTML = `
            <span>${item.title}</span>
            <span class="number">${item.number}</span>
        `;
        div.onclick = () => loadTrack(index);
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

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredPlaylist = [...playlist];
    } else {
        filteredPlaylist = playlist.filter(item => 
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
        nextTrack();
    } else if (e.code === 'ArrowRight') {
        prevTrack();
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

// Initialize theme and playlist
initTheme();
renderPlaylist();
