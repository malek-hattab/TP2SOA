const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./database'); // Assurez-vous que votre base de données est bien définie

const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// 1. Configuration CORS : Autoriser toutes les origines
app.use(cors());

// Pour restreindre aux domaines autorisés, décommentez et adaptez la ligne suivante :
// app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4200'] }));

// 2. Configuration du Rate Limiting : 100 requêtes/15 min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer après 15 minutes.'
});

app.use(limiter);

// Ajoutez ici vos routes existantes
app.get('/personnes', (req, res) => {
    db.all('SELECT * FROM personnes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
