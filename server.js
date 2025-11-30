const express = require('express');
const cors = require('express');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample video data
const videos = [
  {
    _id: '1',
    title: "Epic Soccer Goals Compilation",
    description: "Amazing soccer goals from top leagues around the world. Perfect for sports highlights and montages.",
    duration: "0:45",
    category: "sports",
    uploader: "SoccerEdits",
    views: 12500,
    likes: 842,
    downloads: 1560,
    isCopyrightFree: true,
    tags: ["soccer", "goals", "sports", "football", "highlights"],
    createdAt: new Date()
  },
  {
    _id: '2',
    title: "Anime AMV - Epic Fight Scenes",
    description: "Best anime fight scenes compilation with epic background music. Great for AMV creators.",
    duration: "1:22",
    category: "anime",
    uploader: "AnimeVibes",
    views: 8500,
    likes: 512,
    downloads: 890,
    isCopyrightFree: true,
    tags: ["anime", "fight", "amv", "action", "japanese"],
    createdAt: new Date()
  },
  {
    _id: '3',
    title: "Cinematic Slow Motion Sequences",
    description: "Beautiful slow motion shots from various films and cinematic productions.",
    duration: "0:38",
    category: "slowmo",
    uploader: "FilmMagic",
    views: 7200,
    likes: 421,
    downloads: 650,
    isCopyrightFree: true,
    tags: ["slowmo", "cinematic", "film", "dramatic"],
    createdAt: new Date()
  },
  {
    _id: '4',
    title: "Romantic Sunset Proposal Moments",
    description: "Beautiful romantic moments and proposal scenes with golden hour lighting.",
    duration: "0:28",
    category: "love",
    uploader: "CinematicLove",
    views: 4200,
    likes: 328,
    downloads: 891,
    isCopyrightFree: true,
    tags: ["love", "romantic", "proposal", "sunset", "couple"],
    createdAt: new Date()
  },
  {
    _id: '5',
    title: "Martial Arts Fight Scene Compilation",
    description: "Epic martial arts combat sequences from action films and demonstrations.",
    duration: "0:52",
    category: "action",
    uploader: "ActionFlow",
    views: 5700,
    likes: 512,
    downloads: 1200,
    isCopyrightFree: true,
    tags: ["action", "fight", "martial arts", "combat", "epic"],
    createdAt: new Date()
  },
  {
    _id: '6',
    title: "Aesthetic Nature Transitions",
    description: "Beautiful nature scenes with smooth transitions and calming visuals.",
    duration: "0:35",
    category: "aesthetic",
    uploader: "VisualArts",
    views: 6800,
    likes: 387,
    downloads: 742,
    isCopyrightFree: true,
    tags: ["aesthetic", "nature", "transitions", "calm", "beautiful"],
    createdAt: new Date()
  }
];

// ======================
// API ROUTES
// ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Best Edit Clips API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all videos
app.get('/api/videos', (req, res) => {
  try {
    const { category, limit = 12 } = req.query;
    
    let filteredVideos = videos;
    if (category && category !== 'all') {
      filteredVideos = videos.filter(video => video.category === category);
    }

    const result = filteredVideos.slice(0, parseInt(limit));
    res.json({ videos: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single video by ID
app.get('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    const video = videos.find(v => v._id === videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending videos
app.get('/api/trending', (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const trending = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, parseInt(limit));
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent videos
app.get('/api/recent', (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const recent = [...videos]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));
    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search videos
app.get('/api/search', (req, res) => {
  try {
    const { q, limit = 12 } = req.query;
    
    let results = videos;
    if (q) {
      const query = q.toLowerCase();
      results = videos.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    const finalResults = results.slice(0, parseInt(limit));
    res.json({ videos: finalResults });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like video
app.post('/api/videos/:id/like', (req, res) => {
  try {
    const video = videos.find(v => v._id === req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.likes += 1;
    res.json({ 
      message: 'Video liked successfully', 
      likes: video.likes,
      videoId: video._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download video
app.post('/api/videos/:id/download', (req, res) => {
  try {
    const video = videos.find(v => v._id === req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.downloads += 1;
    res.json({ 
      message: 'Download ready',
      downloads: video.downloads,
      videoId: video._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { name: 'Sports Edits', slug: 'sports', icon: 'fas fa-basketball-ball', videoCount: 1 },
    { name: 'Anime Edits', slug: 'anime', icon: 'fas fa-robot', videoCount: 1 },
    { name: 'Slow-Mo Edits', slug: 'slowmo', icon: 'fas fa-hourglass-half', videoCount: 1 },
    { name: 'Love Edits', slug: 'love', icon: 'fas fa-heart', videoCount: 1 },
    { name: 'Action Edits', slug: 'action', icon: 'fas fa-fist-raised', videoCount: 1 },
    { name: 'Aesthetic Edits', slug: 'aesthetic', icon: 'fas fa-palette', videoCount: 1 }
  ];
  res.json(categories);
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 ==================================');
  console.log('🚀 Best Edit Clips Backend Started!');
  console.log('🚀 ==================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log('✅ No database required - using sample data');
  console.log('✅ All endpoints working');
  console.log('🚀 ==================================');
});