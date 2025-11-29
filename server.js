<script>
    // Enhanced API Configuration for Your Backend
    const API_BASE = 'https://best-edit-clips-backend.onrender.com/api';
    let isBackendOnline = false;

    // Debug function to show connection status
    function showDebugInfo(message, isError = false) {
        const debugDiv = document.getElementById('debugInfo');
        const debugText = document.getElementById('debugText');
        
        if (debugDiv && debugText) {
            debugText.textContent = message;
            debugDiv.style.display = 'block';
            debugDiv.style.background = isError ? '#ff4444' : '#00cc00';
        }
        console.log(`DEBUG: ${message}`);
    }

    // Test backend connection on page load
    async function testBackendConnection() {
        try {
            showDebugInfo('Testing backend connection...');
            
            const response = await fetch(`${API_BASE}/health`);
            
            if (response.ok) {
                const data = await response.json();
                isBackendOnline = true;
                showDebugInfo(`✅ Backend connected: ${data.message || 'Healthy'}`);
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            isBackendOnline = false;
            showDebugInfo(`❌ Backend offline: ${error.message}`, true);
            return false;
        }
    }

    // Enhanced API Functions
    async function fetchVideos(endpoint = '/videos') {
        if (!isBackendOnline) {
            showDebugInfo('Using fallback data - Backend offline', true);
            return getFallbackVideos();
        }

        try {
            console.log(`🔍 Fetching from: ${API_BASE}${endpoint}`);
            const response = await fetch(`${API_BASE}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            // Handle different response structures
            if (data.videos && Array.isArray(data.videos)) return data.videos;
            if (Array.isArray(data)) return data;
            return [];
            
        } catch (error) {
            console.error('❌ API Error:', error);
            showDebugInfo(`API Error: ${error.message} - Using fallback data`, true);
            return getFallbackVideos();
        }
    }

    // Get trending videos
    async function fetchTrendingVideos() {
        const videos = await fetchVideos('/trending?limit=6');
        console.log('📊 Trending videos:', videos);
        return videos;
    }

    // Get recent videos - FIXED for your backend structure
    async function fetchRecentVideos() {
        try {
            const response = await fetch(`${API_BASE}/videos?sortBy=createdAt&sortOrder=desc&limit=6`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('📊 Recent videos data:', data);
            
            // Your backend returns {videos: [], totalPages: x, currentPage: x}
            if (data.videos && Array.isArray(data.videos)) {
                return data.videos;
            }
            return [];
        } catch (error) {
            console.error('Recent videos error:', error);
            return getFallbackVideos();
        }
    }

    // Enhanced search function
    async function searchVideos(query) {
        try {
            const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=12`);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data.videos || data || [];
            
        } catch (error) {
            console.error('Search error:', error);
            return getFallbackVideos().filter(video => 
                video.title.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    // Fallback data
    function getFallbackVideos() {
        return [
            {
                _id: 'fallback-1',
                title: "Epic Soccer Goals Compilation",
                description: "Amazing soccer goals from top leagues around the world.",
                duration: "0:45",
                category: "sports",
                uploader: "SoccerEdits",
                views: 12500,
                likes: 842,
                downloads: 1560,
                isCopyrightFree: true
            },
            {
                _id: 'fallback-2',
                title: "Anime AMV - Epic Fight Scenes", 
                description: "Best anime fight scenes compilation.",
                duration: "1:22",
                category: "anime",
                uploader: "AnimeVibes",
                views: 8500,
                likes: 512,
                downloads: 890,
                isCopyrightFree: true
            },
            {
                _id: 'fallback-3',
                title: "Cinematic Slow Motion Sequences",
                description: "Beautiful slow motion shots from films.",
                duration: "0:38",
                category: "slowmo",
                uploader: "FilmMagic",
                views: 7200,
                likes: 421,
                downloads: 650,
                isCopyrightFree: true
            }
        ];
    }

    // FIXED: Enhanced video display function
    function displayVideos(videos, containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`❌ Container not found: ${containerId}`);
            return;
        }
        
        console.log(`📺 Displaying ${videos.length} videos in ${containerId}:`, videos);
        
        if (!videos || videos.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                    <p style="color: var(--secondary-text);">No videos found</p>
                    <p style="color: var(--accent-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                        Backend Status: ${isBackendOnline ? 'Connected' : 'Offline'}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        videos.forEach(video => {
            const isFallback = video._id && video._id.includes('fallback');
            const videoCard = `
                <div class="card fade-in" onclick="showVideoDetails('${video._id}')">
                    <div class="card-thumbnail">
                        ${video.views > 5000 ? '<div class="trending-badge">Popular</div>' : ''}
                        ${isFallback ? '<div class="trending-badge" style="background: #ff4444;">Demo</div>' : ''}
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${video.title || 'Untitled Video'}</h3>
                        <div class="card-meta">
                            <span>By ${video.uploader || 'Unknown'}</span>
                            <span>${video.duration || '0:00'}</span>
                        </div>
                        <div class="card-stats">
                            <span><i class="fas fa-eye"></i> ${(video.views || 0).toLocaleString()}</span>
                            <span><i class="fas fa-heart"></i> ${video.likes || 0}</span>
                            <span><i class="fas fa-download"></i> ${video.downloads || 0}</span>
                        </div>
                        ${video.isCopyrightFree ? '<div class="copyright-free"><i class="fas fa-check-circle"></i> Copyright Free</div>' : ''}
                        ${isFallback ? '<div style="color: #ff4444; font-size: 0.7rem; margin-top: 0.5rem;">⚠️ Demo Data</div>' : ''}
                    </div>
                </div>
            `;
            container.innerHTML += videoCard;
        });
    }

    // Enhanced initialization
    async function initializeApp() {
        showDebugInfo('Initializing application...');
        
        // Test backend first
        await testBackendConnection();
        
        // Load videos
        await loadHomepageVideos();
        
        // Hide debug after 5 seconds if successful
        if (isBackendOnline) {
            setTimeout(() => {
                const debugDiv = document.getElementById('debugInfo');
                if (debugDiv) debugDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Load homepage videos - FIXED
    async function loadHomepageVideos() {
        try {
            showDebugInfo('Loading videos from database...');
            
            const [trending, recent] = await Promise.all([
                fetchTrendingVideos(),
                fetchRecentVideos()
            ]);
            
            console.log('🎯 Final trending:', trending);
            console.log('🎯 Final recent:', recent);
            
            displayVideos(trending, 'trendingVideos');
            displayVideos(recent, 'recentVideos');
            
            showDebugInfo(`✅ Loaded ${trending.length} trending + ${recent.length} recent videos`);
        } catch (error) {
            console.error('Error loading homepage videos:', error);
            showDebugInfo('Error loading videos', true);
        }
    }

    // Search functionality
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length > 2) {
            searchTimeout = setTimeout(async () => {
                const videos = await searchVideos(searchTerm);
                displayVideos(videos, 'trendingVideos');
                document.getElementById('recentVideos').innerHTML = '<p style="text-align: center; color: var(--secondary-text); grid-column: 1 / -1;">Search results</p>';
            }, 500);
        } else if (searchTerm.length === 0) {
            loadHomepageVideos();
        }
    });

    // Category filter
    async function filterByCategory(category) {
        const videos = await fetchVideos(`/videos?category=${category}&limit=12`);
        displayVideos(videos, 'trendingVideos');
        document.getElementById('recentVideos').innerHTML = '<p style="text-align: center; color: var(--secondary-text); grid-column: 1 / -1;">Switch to "All" to see recent uploads</p>';
    }

    // Video modal functions
    async function showVideoDetails(videoId) {
        if (videoId.includes('fallback')) {
            alert('This is demo data. Backend is currently offline.');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}`);
            if (!response.ok) throw new Error('Failed to fetch video details');
            const video = await response.json();

            const modal = document.getElementById('videoModal');
            const modalContent = document.getElementById('modalContent');

            modalContent.innerHTML = `
                <h2>${video.title}</h2>
                <div style="display: flex; gap: 1rem; margin: 1rem 0; color: var(--secondary-text); flex-wrap: wrap;">
                    <span><i class="fas fa-user"></i> ${video.uploader}</span>
                    <span><i class="fas fa-eye"></i> ${(video.views || 0).toLocaleString()} views</span>
                    <span><i class="fas fa-clock"></i> ${video.duration}</span>
                    <span><i class="fas fa-video"></i> ${video.resolution || '1080p'}</span>
                </div>
                <div style="background: var(--secondary-bg); height: 300px; border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; margin: 1rem 0;">
                    <i class="fas fa-play-circle" style="font-size: 4rem; color: var(--accent);"></i>
                </div>
                <p style="margin-bottom: 1rem;">${video.description || 'No description available.'}</p>
                <div style="margin: 1rem 0;">
                    <div class="card-stats">
                        <span><i class="fas fa-heart"></i> ${video.likes || 0} Likes</span>
                        <span><i class="fas fa-download"></i> ${video.downloads || 0} Downloads</span>
                    </div>
                    ${video.tags && video.tags.length > 0 ? 
                        `<div style="margin-top: 1rem;">
                            <strong>Tags:</strong> ${video.tags.map(tag => `<span style="background: var(--secondary-bg); padding: 0.2rem 0.5rem; border-radius: 4px; margin: 0.2rem; display: inline-block;">${tag}</span>`).join('')}
                        </div>` : ''}
                    ${video.isCopyrightFree ? '<div class="copyright-free" style="margin-top: 1rem;"><i class="fas fa-check-circle"></i> This clip is copyright-free and ready to use in your projects</div>' : ''}
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
                    <button class="upload-btn" onclick="handleDownload('${video._id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="upload-btn" style="background: var(--accent-secondary);" onclick="handleLike('${video._id}')">
                        <i class="fas fa-heart"></i> Like
                    </button>
                </div>
            `;

            modal.style.display = 'flex';
        } catch (error) {
            console.error('Error loading video details:', error);
            showError('Failed to load video details');
        }
    }

    function closeVideoModal() {
        document.getElementById('videoModal').style.display = 'none';
    }

    // Handle like functionality
    async function handleLike(videoId) {
        const result = await likeVideo(videoId);
        if (result && result.success) {
            showVideoDetails(videoId);
        }
    }

    // Handle download functionality
    async function handleDownload(videoId) {
        const result = await downloadVideo(videoId);
        if (result && result.success) {
            if (!result.downloadUrl) {
                showDebugInfo('Download started successfully!');
            }
        }
    }

    async function likeVideo(videoId) {
        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}/like`, { method: 'POST' });
            const data = await response.json();
            if (response.ok) {
                showDebugInfo('Video liked successfully!');
                return data;
            }
        } catch (error) {
            console.error('Like error:', error);
        }
        return { success: false };
    }

    async function downloadVideo(videoId) {
        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}/download`, { method: 'POST' });
            const data = await response.json();
            if (response.ok) {
                showDebugInfo('Download started successfully!');
                return data;
            }
        } catch (error) {
            console.error('Download error:', error);
        }
        return { success: false };
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            
            if (body.classList.contains('light-mode')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'light');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'dark');
            }
        });

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Utility functions
    function showError(message) {
        alert(`Error: ${message}`);
    }

    function showUploadModal() {
        alert('Upload functionality would be available when user is logged in.');
    }

    function showLoginModal() {
        alert('Login functionality would be available when backend is connected.');
    }

    function showRegisterModal() {
        alert('Registration functionality would be available when backend is connected.');
    }

    function toggleUserMenu() {
        alert('User menu would be available when user is logged in.');
    }

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
        
        // Close modal when clicking outside
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeVideoModal();
                }
            });
        }
    });

    // Fade-in animation on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeInOnScroll = () => {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    window.addEventListener('load', fadeInOnScroll);
    window.addEventListener('scroll', fadeInOnScroll);
</script>