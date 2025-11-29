// server.js - Complete Backend for Best Edit Clips
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ======================
// DATABASE CONNECTION
// ======================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/best-edit-clips';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// ======================
// DATABASE MODELS
// ======================

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Video Model
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  duration: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  uploader: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  isCopyrightFree: { type: Boolean, default: true },
  resolution: { type: String, default: '1080p' }
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

// Category Model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'fas fa-folder' },
  color: { type: String, default: '#00ffcc' },
  videoCount: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// ======================
// UTILITY FUNCTIONS
// ======================
const initializeDefaultData = async () => {
  try {
    // Create default categories
    const defaultCategories = [
      { name: 'Sports Edits', slug: 'sports', icon: 'fas fa-basketball-ball', color: '#00ffcc' },
      { name: 'Anime Edits', slug: 'anime', icon: 'fas fa-robot', color: '#ff00aa' },
      { name: 'Movie Edits', slug: 'movie', icon: 'fas fa-film', color: '#ff5e00' },
      { name: 'Slow-Mo Edits', slug: 'slowmo', icon: 'fas fa-hourglass-half', color: '#00ff88' },
      { name: 'Aesthetic Edits', slug: 'aesthetic', icon: 'fas fa-palette', color: '#9d00ff' },
      { name: 'Love Edits', slug: 'love', icon: 'fas fa-heart', color: '#ff4d6d' },
      { name: 'Action Edits', slug: 'action', icon: 'fas fa-fist-raised', color: '#ff0000' },
      { name: 'Music Videos', slug: 'music', icon: 'fas fa-music', color: '#ffcc00' }
    ];

    for (const categoryData of defaultCategories) {
      await Category.findOneAndUpdate(
        { slug: categoryData.slug },
        categoryData,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Default categories initialized');

    // Create sample videos if none exist
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      const sampleVideos = [
        {
          title: "Epic Soccer Goals Compilation",
          description: "Amazing soccer goals from top leagues around the world.",
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
          title: "Anime AMV - Epic Fight Scenes",
          description: "Best anime fight scenes compilation with epic background music.",
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
        }
      ];

      await Video.insertMany(sampleVideos);
      console.log('✅ Sample videos initialized');
    }
  } catch (error) {
    console.log('❌ Error initializing default data:', error.message);
  }
};

// ======================
// API ROUTES
// ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Best Edit Clips API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const { category, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const videos = await Video.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single video
app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trending videos
app.get('/api/trending', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const videos = await Video.find()
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit));
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent videos
app.get('/api/recent', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search videos
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 12 } = req.query;
    
    let query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    const videos = await Video.find(query)
      .sort({ views: -1 })
      .limit(parseInt(limit));

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like video
app.post('/api/videos/:id/like', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.likes += 1;
    await video.save();

    res.json({ 
      message: 'Video liked successfully', 
      likes: video.likes,
      videoId: video._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download video
app.post('/api/videos/:id/download', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.downloads += 1;
    await video.save();

    res.json({ 
      message: 'Download ready',
      downloadUrl: video.videoUrl,
      downloads: video.downloads,
      videoId: video._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize data
app.post('/api/init', async (req, res) => {
  try {
    await initializeDefaultData();
    res.json({ message: 'Database initialized with default data' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

// Initialize default data when server starts
mongoose.connection.once('open', () => {
  initializeDefaultData();
});

app.listen(PORT, () => {
  console.log('🚀 Best Edit Clips Backend Started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
});