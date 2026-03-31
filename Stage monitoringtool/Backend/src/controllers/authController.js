const bcrypt = require("bcrypt")
const User = require("../models/user")

//register flow
exports.register = async (req, res) => {
    const {email, wachtwoord} = req.body
    if (!email || !wachtwoord) {return res.status(400).json({ message: "Email en wachtwoord verplicht" })}
    try {
        const hash = await bcrypt.hash(wachtwoord, 10)
        const existingUser = await User.findByEmail(email)
        if (existingUser) {return res.status(400).json({ message: "Email bestaat al" })}
        await User.create({email, wachtwoord_hash: hash})
        res.status(201).json({message: "Gebruiker aangemaakt"})
    } catch (error) {
        res.status(500).json({message: "Serverfout"})
    }
    
}

//login flow
exports.login = async (req, res) => {
    // opvragen van email en wachtwoord in functie
    const {email, wachtwoord} = req.body
    if (!email || !wachtwoord) {return res.status(400).json({ message: "Email en wachtwoord verplicht" })}
    try {
        const user = await User.findByEmail(email) // zoek naar de user aan de hand van de email
        if (!user) {return res.status(401).json({message: "Onjuiste logingegevens"})}
        const match = await bcrypt.compare(wachtwoord, user.wachtwoord_hash) //vergelijken van wachtwoord met email
        if (!match) {return res.status(401).json({message: "ongeldig wachtwoord"})}
        // sessie opslaan
        req.session.user = {id: user.id, email: user.email, rol: user.rol}
        res.json({message: "Login succesvol", user: req.session.user})
    } catch(err) {
        res.status(500).json({message: "Serverfout"})
    }
}

//