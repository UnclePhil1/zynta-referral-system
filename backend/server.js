require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_TOKEN;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let users = [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      referralCode: "A1B2C3",
      points: 0,
      referrals: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Felix",
      email: "felix@example.com",
      referralCode: "A1B2D2",
      points: 30,
      referrals: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Ronald",
      email: "frank@example.com",
      referralCode: "D23F4G",
      points: 40,
      referrals: [],
      createdAt: new Date().toISOString(),
    },
];

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
}

// Verify JWT middleware
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; 

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    next();
  });
}

// Generate referral code
function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (users.some((user) => user.referralCode === code));
  return code;
}

// Register endpoint
app.post("/api/register", (req, res) => {
  const { name, email, referralCode } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  let referrer = null;
  if (referralCode) {
    referrer = users.find((user) => user.referralCode === referralCode);
    if (!referrer) {
      return res.status(400).json({ error: "Invalid referral code" });
    }
  }

  // Create user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    referralCode: generateReferralCode(),
    points: 0,
    referrals: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Award points to referrer if applicable
  if (referrer) {
    referrer.points += 10;
    referrer.referrals.push(newUser.id);
  }

  const token = generateToken(newUser);

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      referralCode: newUser.referralCode,
      points: newUser.points,
    },
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      points: user.points,
    },
  });
});

app.get("/api/profile", verifyToken, (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Calculate referral count (10 points per referral)
  const referralCount = user.points / 10;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    referralCode: user.referralCode,
    points: user.points,
    referralCount: referralCount, // Add the calculated count
    referrals: user.referrals
      .map((refId) => {
        const refUser = users.find((u) => u.id === refId);
        return {
          name: refUser?.name,
          email: refUser?.email,
          joinedAt: refUser?.createdAt,
        };
      })
      .filter(Boolean),
  });
});

// Get all users (sorted by referral points)
app.get("/api/all-users", verifyToken, (req, res) => {
  try {
    const sanitizedUsers = users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        referralCode: user.referralCode,
        joinedAt: user.createdAt,
      }))
      .sort((a, b) => b.points - a.points);

    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to load users" });
  }
});

app.get('/api/sample-users', (req, res) => {
    try {
        const sampleUsers = users.map(user => ({
            name: user.name,
            points: user.points,
            referralCode: user.referralCode
        })).sort((a, b) => b.points - a.points).slice(0, 3);
        
        res.json(sampleUsers);
    } catch (error) {
        console.error('Error getting sample users:', error);
        res.status(500).json({ error: 'Failed to load sample users' });
    }
});

// Logout endpoint (token invalidation would be client-side)
app.post("/api/logout", verifyToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
