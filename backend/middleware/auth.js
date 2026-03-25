const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "Server auth configuration error" });
    }
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { userId, email }
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
