<script>
    // Enhanced API Configuration for Your Backend
    const API_BASE = 'https://best-edit-clips-backend.onrender.com/api';
    let isBackendOnline = false;

    // Debug function to show connection status
    function showDebugInfo(message, isError = false) {
        const debugDiv = document.getElementById('debugInfo');
        const debugText = document.getElementById('debugText');
        
        debugText.textContent = message;
        debugDiv.style.display = 'block';
        debugDiv.style.background = isError ? '#ff4444' : '#00cc00';
        
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

    // Enhanced API Functions for Your Backend Structure
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
            
            // Handle your backend response structure
            if (data.videos) return data.videos; // For paginated responses
            if (Array.isArray(data)) return data; // For direct array responses
            return [];
            
        } catch (error) {
            console.error('❌ API Error:', error);
            showDebugInfo(`API Error: ${error.message} - Using fallback data`, true);
            return getFallbackVideos();
        }
    }

    // Get trending videos (matches your backend endpoint)
    async function fetchTrendingVideos() {
        return await fetchVideos('/trending?limit=6');
    }

    // Get recent videos (matches your backend endpoint)
    async function fetchRecentVideos() {
        return await fetchVideos('/recent?limit=6');
    }

    // Enhanced search function for your backend
    async function searchVideos(query) {
        if (!isBackendOnline) {
            return getFallbackVideos().filter(video => 
                video.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        try {
            const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=12`);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data.videos || data || [];
            
        } catch (error) {
            console.error('Search error:', error);
            // Fallback client-side search
            return getFallbackVideos().filter(video => 
                video.title.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    // Enhanced like function for your backend
    async function likeVideo(videoId) {
        if (!isBackendOnline) {
            showDebugInfo('Liked video (demo mode)');
            return { success: true, likes: Math.floor(Math.random() * 100) + 1 };
        }

        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            if (response.ok) {
                showDebugInfo('Video liked successfully!');
                return data;
            } else {
                throw new Error(data.message || 'Like failed');
            }
        } catch (error) {
            console.error('Like error:', error);
            showDebugInfo('Like failed - demo mode', true);
            return { success: false };
        }
    }

    // Enhanced download function for your backend
    async function downloadVideo(videoId) {
        if (!isBackendOnline) {
            showDebugInfo('Download started (demo mode)');
            return { success: true };
        }

        try {
            const response = await fetch(`${API_BASE}/videos/${videoId}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            if (response.ok) {
                showDebugInfo('Download started successfully!');
                // If there's a download URL, redirect to it
                if (data.downloadUrl) {
                    window.open(data.downloadUrl, '_blank');
                }
                return data;
            } else {
                throw new Error(data.message || 'Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            showDebugInfo('Download failed - demo mode', true);
            return { success: false };
        }
    }

    // Get categories from your backend
    async function fetchCategories() {
        try {
            const response = await fetch(`${API_BASE}/categories`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return [];
        } catch (error) {
            console.error('Categories error:', error);
            return [];
        }
    }

    // Fallback data when backend is offline - matches your sample data structure
    function getFallbackVideos() {
        return [
            {
                _id: 'fallback-1',
                title: "Epic Soccer Goals Compilation",
                description: "Amazing soccer goals from top leagues around the world. Perfect for sports highlights and montages.",
                videoUrl: "/uploads/sample-soccer.mp4",
                thumbnailUrl: "/uploads/thumbnail-soccer.jpg",
                duration: "0:45",
                category: "sports",
                uploader: "SoccerEdits",
                views: 12500,
                likes: 842,
                downloads: 1560,
                resolution: "1080p",
                tags: ["soccer", "goals", "sports", "football", "highlights"],
                isCopyrightFree: true
            },
            {
                _id: 'fallback-2',
                title: "Anime AMV - Epic Fight Scenes",
                description: "Best anime fight scenes compilation with epic background music. Great for AMV creators.",
                videoUrl: "/uploads/sample-anime.mp4",
                thumbnailUrl: "/uploads/thumbnail-anime.jpg",
                duration: "1:22",
                category: "anime",
                uploader: "AnimeVibes",
                views: 8500,
                likes: 512,
                downloads: 890,
                resolution: "1080p",
                tags: ["anime", "fight", "amv", "action", "japanese"],
                isCopyrightFree: true
            },
            {
                _id: 'fallback-3',
                title: "Cinematic Slow Motion Sequences",
                description: "Beautiful slow motion shots from various films and cinematic productions.",
                videoUrl: "/uploads/sample-slowmo.mp4",
                thumbnailUrl: "/uploads/thumbnail-slowmo.jpg",
                duration: "0:38",
                category: "slowmo",
                uploader: "FilmMagic",
                views: 7200,
                likes: 421,
                downloads: 650,
                resolution: "1080p",
                tags: ["slowmo", "cinematic", "film", "dramatic"],
                isCopyrightFree: true
            },
            {
                _id: 'fallback-4',
                title: "Romantic Sunset Proposal Moments",
                description: "Beautiful romantic moments and proposal scenes with golden hour lighting.",
                videoUrl: "/uploads/sample-love.mp4",
                thumbnailUrl: "/uploads/thumbnail-love.jpg",
                duration: "0:28",
                category: "love",
                uploader: "CinematicLove",
                views: 4200,
                likes: 328,
                downloads: 891,
                resolution: "1080p",
                tags: ["love", "romantic", "proposal", "sunset", "couple"],
                isCopyrightFree: true
            },
            {
                _id: 'fallback-5',
                title: "Martial Arts Fight Scene Compilation",
                description: "Epic martial arts combat sequences from action films and demonstrations.",
                videoUrl: "/uploads/sample-action.mp4",
                thumbnailUrl: "/uploads/thumbnail-action.jpg",
                duration: "0:52",
                category: "action",
                uploader: "ActionFlow",
                views: 5700,
                likes: 512,
                downloads: 1200,
                resolution: "1080p",
                tags: ["action", "fight", "martial arts", "combat", "epic"],
                isCopyrightFree: true
            },
            {
                _id: 'fallback-6',
                title: "Aesthetic Nature Transitions",
                description: "Beautiful nature scenes with smooth transitions and calming visuals.",
                videoUrl: "/uploads/sample-aesthetic.mp4",
                thumbnailUrl: "/uploads/thumbnail-aesthetic.jpg",
                duration: "0:35",
                category: "aesthetic",
                uploader: "VisualArts",
                views: 6800,
                likes: 387,
                downloads: 742,
                resolution: "1080p",
                tags: ["aesthetic", "nature", "transitions", "calm", "beautiful"],
                isCopyrightFree: true
            }
        ];
    }

    // Enhanced video display with debugging
    function displayVideos(videos, containerId) {
        const container = document.getElementById(containerId);
        
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
            const isFallback = video._id.includes('fallback');
            const videoCard = `
                <div class="card fade-in" onclick="showVideoDetails('${video._id}')">
                    <div class="card-thumbnail">
                        ${video.views > 5000 ? '<div class="trending-badge">Popular</div>' : ''}
                        ${isFallback ? '<div class="trending-badge" style="background: #ff4444;">Demo</div>' : ''}
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${video.title}</h3>
                        <div class="card-meta">
                            <span>By ${video.uploader}</span>
                            <span>${video.duration}</span>
                        </div>
                        <div class="card-stats">
                            <span><i class="fas fa-eye"></i> ${video.views?.toLocaleString() || 0}</span>
                            <span><i class="fas fa-heart"></i> ${video.likes || 0}</span>
                            <span><i class="fas fa-download"></i> ${video.downloads || 0}</span>
                        </div>
                        ${video.isCopyrightFree ? '<div class="copyright-free"><i class="fas fa-check-circle"></i> Copyright Free</div>' : ''}
                        ${isFallback ? '<div style="color: #ff4444; font-size: 0.7rem; margin-top: 0.5rem;">⚠️ Demo Data - Backend Offline</div>' : ''}
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
                document.getElementById('debugInfo').style.display = 'none';
            }, 5000);
        }
    }

    // Load homepage videos
    async function loadHomepageVideos() {
        try {
            showDebugInfo('Loading videos from database...');
            
            const [trending, recent] = await Promise.all([
                fetchTrendingVideos(),
                fetchRecentVideos()
            ]);
            
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

    // Category filter - matches your backend categories
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
                    <span><i class="fas fa-eye"></i> ${video.views?.toLocaleString() || 0} views</span>
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
            // Refresh the video details to show updated like count
            showVideoDetails(videoId);
        }
    }

    // Handle download functionality
    async function handleDownload(videoId) {
        const result = await downloadVideo(videoId);
        if (result && result.success) {
            // If download URL is provided, it will open automatically
            if (!result.downloadUrl) {
                showDebugInfo('Download started successfully!');
            }
        }
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
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

    // Utility functions
    function showError(message) {
        alert(`Error: ${message}`);
    }

    function showUploadModal() {
        alert('Upload functionality would be available when backend is connected and user is logged in.');
    }

    function showLoginModal() {
        alert('Login functionality would be available when backend is connected.');
    }

    function showRegisterModal() {
        alert('Registration functionality would be available when backend is connected.');
    }

    function toggleUserMenu() {
        alert('User menu would be available when backend is connected and user is logged in.');
    }

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
        
        // Close modal when clicking outside
        document.getElementById('videoModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeVideoModal();
            }
        });
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