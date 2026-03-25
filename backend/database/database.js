const mysql = require("mysql2/promise"); // Usando promessas para bater com seus 'await'
require("dotenv").config();

// Conexão com banco do raio-x (bdraiox)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'bdraiox',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Conexão com banco de pacientes (corpore)
const connectPacientes = mysql.createPool({
  host: process.env.PACIENTES_DB_HOST || 'localhost',
  user: process.env.PACIENTES_DB_USER || 'root',
  password: process.env.PACIENTES_DB_PASSWORD || '',
  database: process.env.PACIENTES_DB_DATABASE || 'corpore',
  port: process.env.PACIENTES_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Exportando para bater com o que suas rotas esperam
module.exports = { pool, connectPacientes };