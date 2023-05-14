const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'quadb',
  password: 'root',
  port: 5432, 
});

// Check if connected to the database successfully
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// Fetch data from the API and store it in the database
async function fetchData() {
    const url = 'https://api.wazirx.com/api/v2/tickers';
    const response = await fetch(url);
    const data = await response.json();
  
    const records = Object.entries(data)
      .map(([key, value]) => {
        const { name, last, buy, sell, volume, base_unit } = value;
        if (!name) {
          return null;
        }
        return [name, last, buy, sell, volume, base_unit];
      })
      .filter(Boolean)
      .slice(0, 10);
  
    const query = 'INSERT INTO tickers(name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6),($7, $8, $9, $10, $11, $12),($13, $14, $15, $16, $17, $18),($19, $20, $21, $22, $23, $24),($25, $26, $27, $28, $29, $30),($31, $32, $33, $34, $35, $36),($37, $38, $39, $40, $41, $42),($43, $44, $45, $46, $47, $48),($49, $50, $51, $52, $53, $54),($55, $56, $57, $58, $59, $60)';
  
    pool.connect((err, client, done) => {
      if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
        return;
      }
      const values = records.flatMap(row => [
        row[0],
        row[1],
        row[2],
        row[3],
        row[4],
        row[5],
      ]);
  
      client.query(query, values, (err, result) => {
        done();
        if (err) {
          console.error('Error inserting data into PostgreSQL:', err.stack);
        } else {
          console.log('Data inserted into PostgreSQL');
        }
      });
    });
  }
  

// Fetch data from the database 
app.get('/tickers', (req, res) => {
const query = 'SELECT * FROM tickers ORDER BY last DESC LIMIT 10';

  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error querying data from PostgreSQL:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const tickers = result.rows.map(row => ({
        name: row.name,
        last: row.last,
        buy: row.buy,
        sell: row.sell,
        volume: row.volume,
        base_unit: row.base_unit,
      }));

      res.json(tickers);
    }
  });
});
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
fetchData();






