const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    connectionString: process.env.HOST,
    ssl: {
        rejectUnauthorized: false
    }
});


module.exports = {
    pool
}