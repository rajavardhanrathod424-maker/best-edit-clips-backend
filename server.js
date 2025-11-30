const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Sample video data
const videos = [
  {
    _id: '1', title: "Epic Soccer Goals", duration: "0:45", category: "sports",
    uploader: "SoccerEdits", views: 12500, likes: 842, downloads: 1560
  },
  {
    _id: '2', title: "Anime Fight Scenes", duration: "1:22", category: "anime", 
    uploader: "AnimeVibes", views: 8500, likes: 512, downloads: 890
  },
  {
    _id: '3', title: "Slow Motion Cinematic", duration: "0:38", category: "slowmo",
    uploader: "FilmMagic", views: 7200, likes: 421, downloads: 650
  },
  {
    _id: '4', title: "Romantic Sunset Moments", duration: "0:28", category: "love",
    uploader: "CinematicLove", views: 4200, likes: 328, downloads: 891
  },
  {
    _id: '5', title: "Martial Arts Fights", duration: "0:52", category: "action",
    uploader: "ActionFlow", views: 5700, likes: 512, downloads: 1200
  },
  {
    _id: '6', title: "Nature Aesthetic", duration: "0:35", category: "aesthetic",
    uploader: "VisualArts", views: 6800, likes: 387, downloads: 742
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API Working!' });
});

// Get all videos
app.get('/api/videos', (req, res) => {
  res.json({ videos });
});

// Get trending videos
app.get('/api/trending', (req, res) => {
  const trending = [...videos].sort((a, b) => b.views - a.views).slice(0, 6);
  res.json(trending);
});

// Get recent videos  
app.get('/api/recent', (req, res) => {
  const recent = [...videos].slice(0, 6);
  res.json(recent);
});

// Search videos
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = videos.filter(video => 
    video.title.toLowerCase().includes(query)
  );
  res.json({ videos: results });
});

// Like video
app.post('/api/videos/:id/like', (req, res) => {
  res.json({ message: 'Liked!', likes: Math.floor(Math.random() * 1000) + 500 });
});

// Download video
app.post('/api/videos/:id/download', (req, res) => {
  res.json({ message: 'Download started!' });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port 5000');
  console.log('✅ API Ready: http://localhost:5000/api/health');
});