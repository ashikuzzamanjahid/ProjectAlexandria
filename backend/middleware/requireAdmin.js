const User = require("../models/User");

module.exports = async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user.userId, "role");
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Admin access required" });
        }
        req.authUserRole = user.role;
        return next();
    } catch {
        return res.status(500).json({ error: "Failed to verify admin role" });
    }
};
