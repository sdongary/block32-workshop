const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_shop')
const app = express()


app.use(express.json());
app.use(require('morgan')('dev'));

// app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/flavors', async (req, res, next) => {
  console.log('inside select all api...');
  try {
    const SQL = `SELECT * FROM flavors;`;
    const result = await client.query(SQL);
    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});

// route for get() select single
app.get('/api/flavors/:id', async (req, res, next) => {
  console.log('inside select by id api...');
  try {
    const SQL = `SELECT * FROM flavors 
                WHERE id=$1`;
    const result = await client.query(SQL, [req.params.id]);
    res.send(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// route for post() insert new
app.post('/api/flavors', async (req, res, next) => {
  console.log('inside insert new api...');
  try {
    const SQL = `INSERT INTO flavors(name, is_favorite) 
                VALUES($1, $2) RETURNING *;`;
    const result = await client.query(SQL, [req.body.name, req.body.is_favorite]);
    res.send(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// route for put() update existing record
app.put('/api/flavors/:id', async (req, res, next) => {
  console.log('inside update api...');
  try {
    const SQL = `UPDATE flavors
                SET name=$1, is_favorite=$2, updated_at=now() 
                WHERE id=$3 RETURNING *;`;
    const result = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
    res.send(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// route for delete() delete existing record
app.delete('/api/flavors/:id', async (req, res, next) => {
  console.log('inside delete api...');
  try {
    const SQL = `DELETE FROM flavors 
                WHERE id=$1`;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});


const init = async () => {
await client.connect();
console.log('connected to database');

console.log('seeding db');
let SQL = `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
id SERIAL PRIMARY KEY,
name varchar(255),
is_favorite BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now(
);

INSERT INTO flavors(name, is_favorite) VALUES('vanilla'), false;
INSERT INTO flavors(name, is_favorite) VALUES('chocolate', true);
INSERT INTO flavors(name,is_favorite) VALUES('strawberry', true);
INSERT INTO flavors(name) VALUES('mint');
`;
await client.query(SQL);
console.log('data seeded');

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))

};

init();