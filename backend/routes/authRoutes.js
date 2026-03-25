const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/auth");

const createAuthRoutes = ({ User }) => {
    const router = express.Router();

    router.post("/register", async (req, res) => {
        try {
            const { email, password, displayName } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }
            if (typeof email !== "string" || typeof password !== "string") {
                return res.status(400).json({ error: "Invalid input" });
            }

            const trimmedEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                return res.status(400).json({ error: "Invalid email address" });
            }
            if (password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters" });
            }

            const existing = await User.findOne({ email: trimmedEmail });
            if (existing) {
                return res.status(409).json({ error: "Email already registered" });
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const user = await User.create({
                email: trimmedEmail,
                passwordHash,
                displayName: typeof displayName === "string" ? displayName.trim() : "",
                role: "student",
            });

            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(201).json({ token, email: user.email, displayName: user.displayName, role: user.role });
        } catch (error) {
            console.error("Register error:", error);
            return res.status(500).json({ error: "Registration failed" });
        }
    });

    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password || typeof email !== "string" || typeof password !== "string") {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const user = await User.findOne({ email: email.trim().toLowerCase() });
            if (!user) return res.status(401).json({ error: "Invalid credentials" });

            const match = await bcrypt.compare(password, user.passwordHash);
            if (!match) return res.status(401).json({ error: "Invalid credentials" });

            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.json({ token, email: user.email, displayName: user.displayName, role: user.role });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ error: "Login failed" });
        }
    });

    router.get("/me", requireAuth, async (req, res) => {
        try {
            const user = await User.findById(req.user.userId, "email displayName role createdAt");
            if (!user) return res.status(404).json({ error: "User not found" });
            return res.json({
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                createdAt: user.createdAt,
            });
        } catch {
            return res.status(500).json({ error: "Failed to fetch user" });
        }
    });

    return router;
};

module.exports = { createAuthRoutes };
