// authenticatie --> kijkt of er een session is voor de user
exports.isAuthenticated = function (req,res,next) {
    if (!req.session.user) {return res.status(401).json({message: "Niet ingelogd"})}
    next()
}