require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const connectDB = require("./config/db");

// ─── Environment Variables ───────────────────────────────────
const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

const SERVER_URL =
    process.env.SERVER_URL || "http://localhost:5000";

// ─── Routes ──────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail");
const historyRoutes = require("./routes/history");

// ─── App ─────────────────────────────────────────────────────
const app = express();

// ─── Connect MongoDB ─────────────────────────────────────────
connectDB();

// ─── CORS ────────────────────────────────────────────────────
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser ───────────────────────────────────────────
app.use(cookieParser());

// ─── Trust Render Proxy ──────────────────────────────────────
app.set("trust proxy", 1);

// ─── Session ────────────────────────────────────────────────
app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "MailScrapping_session_secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge: 24 * 60 * 60 * 1000,

            httpOnly: true,
        },

        name: "mailscrapping.sid",
    })
);

// ─── Passport ────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/history", historyRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        message: "MailScrapping API is running 🚀",
        status: "OK",
    });
});

// ─── API Health Check ────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is healthy 🚀",
    });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);

    res.status(500).json({
        message: "Internal server error",
    });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `🚀 MailScrapping server running on port ${PORT}`
    );
    console.log(`🌐 Server URL: ${SERVER_URL}`);
    console.log(`🔗 Client URL: ${CLIENT_URL}`);
});