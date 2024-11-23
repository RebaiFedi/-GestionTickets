const sql = require('mssql');
require('dotenv').config();

// Vérification des variables d'environnement
const requiredEnvVars = ['SQL_USER', 'SQL_PASSWORD', 'SQL_SERVER', 'SQL_DATABASE'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`La variable d'environnement ${varName} est manquante`);
  }
});

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
console.log('Configuration SQL:', {
  user: config.user,
  server: config.server,
  database: config.database
});

async function executeQuery(query, params) {
  try {
    await sql.connect(config);
    const request = new sql.Request();
    for (const key in params) {
      request.input(key, params[key]);
    }
    const result = await request.query(query);
    console.log('Résultat de la requête SQL:', result);
    return result;
  } catch (err) {
    console.error('Erreur SQL:', err);
    throw err;
  } finally {
    await sql.close();
  }
}

async function testConnection() {
  try {
    await sql.connect(config);
    console.log('Connexion à SQL Server réussie');
    await sql.close();
  } catch (err) {
    console.error('Erreur de connexion à SQL Server:', err);
  }
}

testConnection();

module.exports = { executeQuery };
