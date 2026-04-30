const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

const app = express();

const LoggerMiddleware = (req, res, next) => {
    console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
    next();
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(LoggerMiddleware);
app.set('view engine', 'ejs');

const uri = "mongodb+srv://liboteanbogdan361_db_user:J0O9jZBQmgJxTwOy@cluster0.wff16fs.mongodb.net/students?retryWrites=true&w=majority&appName=Cluster0";

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/insert', (req, res) => {
    
    const dbConnection = mongoose.createConnection(uri, { dbName: 'students' });

    dbConnection.once('open', async function() {
        try {
            const collection = dbConnection.collection("activitati");
            const dataDeTest = [
                { week: 1, project: "Setup Mediu", course: "Introducere Node.js" },
                { week: 2, project: "Baze de date", course: "MongoDB Atlas" },
                { week: 3, project: "Interfata Web", course: "EJS & Express" }
            ];

            await collection.insertMany(dataDeTest);
            res.send("<h1>Datele au fost inserate!</h1><br><a href='/'>Inapoi</a>");
        } catch (err) {
            res.status(500).send("Eroare la inserare: " + err);
        } finally {
            dbConnection.close();
        }
    });
});

app.get('/list', async (req, res) => {
    const dbConnection = mongoose.createConnection(uri);

    try {
        await new Promise((resolve, reject) => {
            dbConnection.once('open', resolve);
            dbConnection.on('error', reject);
        });

        const collection = dbConnection.collection("activitati");
        const items = await collection.find({}).toArray();
        
        res.render('list', { studenti: items });

    } catch (err) {
        console.error("Eroare:", err);
        res.status(500).send("Eroare la procesarea datelor: " + err.message);
    } finally {
        dbConnection.close();
    }
});

app.listen(3000, () => {
    console.log('Serverul ruleaza pe http://localhost:3000');
});