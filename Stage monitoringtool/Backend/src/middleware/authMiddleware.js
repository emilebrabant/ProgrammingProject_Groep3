// authenticatie --> kijkt of er een session is voor de user
export function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Niet ingelogd" });
    }
    next();
}