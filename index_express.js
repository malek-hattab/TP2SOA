const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
    res.json("Registre de personnes! Choisissez le bon routage!");
});

// Récupérer toutes les personnes
app.get('/personnes', (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Récupérer une personne par ID
app.get('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": row });
    });
});

// Créer une nouvelle personne
/*app.post('/personnes', (req, res) => {
    const nom = req.body.nom;
    db.run(`INSERT INTO personnes (nom) VALUES (?)`, [nom], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": { id: this.lastID } });
    });
});

// Mettre à jour une personne
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const nom = req.body.nom;
    db.run(`UPDATE personnes SET nom = ? WHERE id = ?`, [nom, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});
*/
//Mise à jour des routes POST et PUT dans index.js pour gérer l’adresse 
// Modifier la route POST
app.post('/personnes', (req, res) => {
    const { nom, adresse } = req.body;
    db.run(`INSERT INTO personnes (nom, adresse) VALUES (?, ?)`, [nom, adresse], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": { id: this.lastID } });
    });
});

// Modifier la route PUT
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body;
    db.run(`UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`, [nom, adresse, id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});


// Supprimer une personne
app.delete('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
