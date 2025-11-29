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

// Category Model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'fas fa-folder' },
  color: { type: String, default: '#00ffcc' },
  videoCount: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

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

// ======================
// FILE UPLOAD CONFIG
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// ======================
// AUTH MIDDLEWARE
// ======================
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'best-edit-clips-secret-key-2024');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

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
          tags: ["soccer", "goals", "sports", "football", "highlights"]
        },
        {
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
          tags: ["anime", "fight", "amv", "action", "japanese"]
        },
        {
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
          tags: ["slowmo", "cinematic", "film", "dramatic"]
        },
        {
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
          tags: ["love", "romantic", "proposal", "sunset", "couple"]
        },
        {
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
          tags: ["action", "fight", "martial arts", "combat", "epic"]
        },
        {
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
          tags: ["aesthetic", "nature", "transitions", "calm", "beautiful"]
        }
      ];

      await Video.insertMany(sampleVideos);
      
      // Update category counts
      for (const category of defaultCategories) {
        const count = await Video.countDocuments({ category: category.slug });
        await Category.findOneAndUpdate(
          { slug: category.slug },
          { videoCount: count }
        );
      }
      console.log('✅ Sample videos initialized');
    }
  } catch (error) {
    console.log('❌ Error initializing default data:', error.message);
  }
};

// ======================
// AUTH ROUTES
// ======================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'best-edit-clips-secret-key-2024',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'best-edit-clips-secret-key-2024',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// VIDEO ROUTES
// ======================

// Get all videos with filters
app.get('/api/videos', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search in title, description and tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const videos = await Video.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single video
app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload video
app.post('/api/videos/upload', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, tags, duration, resolution } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const video = new Video({
      title,
      description: description || '',
      videoUrl: `/uploads/${req.files.video[0].filename}`,
      thumbnailUrl: req.files.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : '/uploads/default-thumbnail.jpg',
      duration: duration || '0:30',
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploader: req.user.username,
      resolution: resolution || '1080p',
      isCopyrightFree: true
    });

    await video.save();

    // Update category count
    await Category.findOneAndUpdate(
      { slug: category },
      { $inc: { videoCount: 1 } }
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like video
app.post('/api/videos/:id/like', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

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
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

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

// Get user's uploaded videos
app.get('/api/videos/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const videos = await Video.find({ uploader: username })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments({ uploader: username });

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// CATEGORY ROUTES
// ======================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category by slug
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get videos for this category
    const videos = await Video.find({ category: req.params.slug })
      .sort({ views: -1 })
      .limit(12);

    res.json({
      category,
      videos
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// TRENDING & SEARCH ROUTES
// ======================

// Get trending videos (most viewed and liked)
app.get('/api/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

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
    const { limit = 12 } = req.query;

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
    const { q, category, page = 1, limit = 12 } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const videos = await Video.find(query)
      .sort({ views: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({ 
      videos, 
      total, 
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// STATISTICS ROUTES
// ======================

// Get platform statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalDownloads = await Video.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalUsers = await User.countDocuments();

    const topCategories = await Category.find()
      .sort({ videoCount: -1 })
      .limit(5);

    res.json({
      totalVideos,
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalUsers,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// INITIALIZATION ROUTE
// ======================

// Initialize default data
app.post('/api/init', async (req, res) => {
  try {
    await initializeDefaultData();
    res.json({ message: 'Database initialized with default data' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Best Edit Clips API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/videos',
      'GET /api/videos/:id',
      'POST /api/videos/upload',
      'GET /api/categories',
      'GET /api/trending',
      'GET /api/search',
      'POST /api/init'
    ]
  });
});

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
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
  console.log('🚀 ==================================');
  console.log('🚀 Best Edit Clips Backend Started!');
  console.log('🚀 ==================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${MONGODB_URI}`);
  console.log('📚 Available endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/videos');
  console.log('   POST /api/videos/upload');
  console.log('   GET  /api/categories');
  console.log('   GET  /api/trending');
  console.log('   GET  /api/search');
  console.log('   POST /api/init');
  console.log('🚀 ==================================');
});

module.exports = app;