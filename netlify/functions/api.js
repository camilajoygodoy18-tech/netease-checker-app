const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary JSON storage
let users = [];
let apiKeys = [];

// JWT Secret (should be environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Initialize admin user if not exists
const initAdmin = () => {
  const adminExists = users.find(u => u.role === 'admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      apiKey: uuidv4(),
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    apiKeys.push({
      key: adminUser.apiKey,
      status: 'active',
      owner: adminUser.id,
      createdAt: new Date().toISOString()
    });
  }
};
initAdmin();

// Routes

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;

    // Check if user exists
    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role,
      apiKey: uuidv4(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    apiKeys.push({
      key: newUser.apiKey,
      status: 'active',
      owner: newUser.id,
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        apiKey: newUser.apiKey
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        apiKey: user.apiKey
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    apiKey: user.apiKey,
    createdAt: user.createdAt
  });
});

app.get('/api/apikey', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const apiKey = apiKeys.find(k => k.owner === user.id);
  res.json({
    key: user.apiKey,
    status: apiKey ? apiKey.status : 'inactive',
    createdAt: apiKey ? apiKey.createdAt : null
  });
});

// AI Status
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Connected Successfully',
    checker: false
  });
});

// Admin Routes
app.get('/api/admin/dashboard', authenticateToken, authenticateAdmin, (req, res) => {
  const totalUsers = users.length;
  const activeApiKeys = apiKeys.filter(k => k.status === 'active').length;
  const connectedUsers = users.filter(u => u.role === 'user').length;

  res.json({
    totalUsers,
    activeApiKeys,
    connectedUsers,
    systemStatus: 'online'
  });
});

app.post('/api/admin/generate-key', authenticateToken, authenticateAdmin, (req, res) => {
  const { userId } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newKey = uuidv4();
  user.apiKey = newKey;
  
  const existingKey = apiKeys.find(k => k.owner === userId);
  if (existingKey) {
    existingKey.key = newKey;
    existingKey.status = 'active';
    existingKey.createdAt = new Date().toISOString();
  } else {
    apiKeys.push({
      key: newKey,
      status: 'active',
      owner: userId,
      createdAt: new Date().toISOString()
    });
  }

  res.json({
    key: newKey,
    status: 'active',
    createdAt: new Date().toISOString()
  });
});

app.post('/api/admin/revoke-key', authenticateToken, authenticateAdmin, (req, res) => {
  const { userId } = req.body;
  
  const apiKey = apiKeys.find(k => k.owner === userId);
  if (apiKey) {
    apiKey.status = 'revoked';
    res.json({ message: 'API Key revoked successfully' });
  } else {
    res.status(404).json({ error: 'API Key not found' });
  }
});

app.get('/api/admin/users', authenticateToken, authenticateAdmin, (req, res) => {
  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    apiKey: u.apiKey,
    createdAt: u.createdAt
  }));
  res.json(userList);
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the handler
exports.handler = serverless(app);