const express = require('express');
const app = express();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');

app.use(express.json());
app.use(cors());

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to DB: ', err);
  } else {
    console.log('Connected to DB successfully', db.threadId);
  }
});

// GET METHOD EXAMPLE
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/data', (req, res) => {
  db.query('SELECT * FROM patients', (err, patientResults) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving patient data');
    } else {
      db.query('SELECT * FROM providers', (err, providerResults) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error retrieving provider data');
        } else {
          const results = {
            patients: patientResults,
            providers: providerResults,
          };
          res.render('data', { results }); // Pass the 'results' object to the template
        }
      });
    }
  });
});

// Endpoint to retrieve patients by first name
app.get('/patients', (req, res) => {
    const firstName = req.query.firstName;
    if (!firstName) {
      return res.status(400).send('First name is required');
    }
  
    db.query('SELECT * FROM patients WHERE first_name = ?', [firstName], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving patients');
      }
      res.json(results);
    });
  });
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
  console.log('Sending message to browser...');
  app.get('/', (req, res) => {
    res.send('Server started successfully');
  });
});
