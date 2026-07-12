const mysql = require('mysql2/promise');
const env = require('./env');

function createPool() {
  return mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    waitForConnections: true,
    connectionLimit: env.db.poolLimit,
    queueLimit: 0,
    multipleStatements: true,
  });
}

module.exports = createPool;
