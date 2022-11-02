require('dotenv').config()
const { Pool } = require('pg')
const url = {
  dev: process.env.DB_URL,
  test: process.env.DB_URL_TEST
}
const pool = new Pool({
  connectionString: url[process.env.NODE_ENV]
})
pool.on('error', (err, client) => {
  console.log('Error:', err);
});
module.exports = pool