const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

//  Configuration de la session pour Keycloak
const memoryStore = new session.MemoryStore();
app.use(session({
    secret: 'api-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

//  Initialisation de Keycloak
const keycloak = new Keycloak({ store: memoryStore }, './keycloak-config.json');
app.use(keycloak.middleware());

const PORT = 3000;

//  Connexion à la base de données SQLite
const db = new sqlite3.Database('./maBaseDeDonnees.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Erreur de connexion à SQLite :", err.message);
    } else {
        console.log("Connecté à la base de données SQLite.");
        db.run(`CREATE TABLE IF NOT EXISTS personnes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            adresse TEXT
        )`);
    }
});

//  Route non sécurisée
app.get('/', (req, res) => {
    res.json("Bienvenue sur l'API sécurisée !");
});

//  Route sécurisée avec Keycloak
app.get('/secure', keycloak.protect(), (req, res) => {
    res.json({ message: 'Vous êtes authentifié !' });
});

//  Route sécurisée pour récupérer toutes les personnes
app.get('/personnes', keycloak.protect(), (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

// Route sécurisée pour ajouter une personne
app.post('/personnes', keycloak.protect(), (req, res) => {
    const { nom, adresse } = req.body;
    if (!nom) {
        return res.status(400).json({ error: "Le champ 'nom' est requis." });
    }

    db.run(`INSERT INTO personnes (nom, adresse) VALUES (?, ?)`, [nom, adresse], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: { id: this.lastID } });
    });
});

//  Route sécurisée pour mettre à jour une personne
app.put('/personnes/:id', keycloak.protect(), (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body;
    if (!nom) {
        return res.status(400).json({ error: "Le champ 'nom' est requis." });
    }

    db.run(`UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`, [nom, adresse, id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success" });
    });
});

//  Route sécurisée pour supprimer une personne
app.delete('/personnes/:id', keycloak.protect(), (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success" });
    });
});

//  Démarrer le serveur
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
