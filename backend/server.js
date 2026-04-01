require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail");
const historyRoutes = require("./routes/history");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy is required for Render (since it's behind a reverse proxy) to correctly identify HTTPS (for cookies)
app.set("trust proxy", 1);

// Session is needed for Passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || "MailScrapping_session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // must be true on Render
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // needed for cross-origin cookies in prod
            maxAge: 24 * 60 * 60 * 1000
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/history", historyRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "MailScrapping API is running 🚀" });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);
    res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 MailScrapping server running on http://localhost:${PORT}`);
});
