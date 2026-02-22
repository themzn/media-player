let currentIndex = -1;
let filteredPlaylist = [...playlist];

const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');
const currentTitle = document.getElementById('currentTitle');
const currentNumber = document.getElementById('currentNumber');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');

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
nextBtn.addEventListener('click', togglePlayPause);
playPauseBtn.addEventListener('click', togglePlayPause);

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

// Initial render
renderPlaylist();
