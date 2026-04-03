
// Controleren of de ingelogde gebruiker de juiste rol heeft

export function heeftRol(toegestaneRollen) {
    return function (req, res, next) {
        if (!req.session.user) {
            return res.status(401).json({ message: "Niet ingelogd" });
        }
        if (!toegestaneRollen.includes(req.session.user.rol)) {
            return res.status(403).json({ message: "Geen toegang" });
        }
        next();
    };
}