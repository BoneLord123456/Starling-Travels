import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import Database from "better-sqlite3";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ecobalance.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    ecoPoints INTEGER DEFAULT 0,
    isPremium BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destId TEXT NOT NULL,
    userName TEXT NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date TEXT NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, passwordHash } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)");
      const result = stmt.run(name, email, passwordHash);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, passwordHash } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND passwordHash = ?").get(email, passwordHash);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", (req, res) => {
    const users = db.prepare("SELECT name, ecoPoints FROM users ORDER BY ecoPoints DESC LIMIT 10").all();
    res.json(users);
  });

  // Points Update
  app.post("/api/users/points", (req, res) => {
    const { email, points } = req.body;
    try {
      db.prepare("UPDATE users SET ecoPoints = ecoPoints + ? WHERE email = ?").run(points, email);
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Reviews
  app.get("/api/reviews/:destId", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews WHERE destId = ? ORDER BY id DESC").all(req.params.destId);
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { destId, userName, comment, rating } = req.body;
    const date = new Date().toISOString().split('T')[0];
    try {
      db.prepare("INSERT INTO reviews (destId, userName, comment, rating, date) VALUES (?, ?, ?, ?, ?)").run(destId, userName, comment, rating, date);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Weather API Proxy
  app.get("/api/weather", async (req, res) => {
    const { q } = req.query;
    const apiKey = process.env.WEATHER_API_KEY || "e48b764761c44c96ba4185824262002";
    try {
      const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${q}&days=3&aqi=yes`);
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
