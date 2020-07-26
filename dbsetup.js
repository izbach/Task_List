const Pool = require('pg').Pool
const pool = new Pool({
  user: 'isaac',
  host: 'localhost',
  database: 'ymcatest',
  password: 'NotRealPassword',
  port: 5432,
})

module.exports = pool;

