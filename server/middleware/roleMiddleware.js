// Usage: roleMiddleware("admin") or roleMiddleware("admin", "manager")
export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Your role '${req.user.role}' is not authorized for this action.`,
            });
        }

        next();
    };
};