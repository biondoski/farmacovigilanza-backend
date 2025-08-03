const User = require('../models/User');
const bcrypt = require('bcryptjs'); // <-- AGGIUNGI QUESTA RIGA MANCANTE

// @desc    Ottiene tutti gli utenti
exports.getUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json(users);
};

// @desc    Crea un nuovo utente (solo Admin)
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Per favore, fornisci tutti i campi: nome, email, password e ruolo.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Utente già esistente con questa email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Rimuoviamo la password dalla risposta
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);

    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};

// @desc    Elimina un utente
exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.status(200).json({ message: 'Utente eliminato' });
};


exports.updateUser = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        const updatedUser = await user.save();

        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ message: 'Errore del server', error: err.message });
    }
};
