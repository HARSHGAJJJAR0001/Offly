import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // Frontend sends raw token (no "Bearer " prefix) — matches axios interceptor
        const token = req.headers.authorization || req.headers.Authorization;

        if (!token)
            return res.status(401).json({ message: "Unauthorized — no token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user)
            return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};