const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'mysql-1d5a184a-sharmapranay38-f5ed.h.aivencloud.com',
    port: 16167,
    user: 'avnadmin',
    password: 'AVNS_qHb808jxCTAJDLEVxW5',
    database: 'defaultdb',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const migrationDir = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(migrationDir)).filter(f => f.endsWith('.sql'));
    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationDir, file), 'utf8');
      // Split by semicolon, filter out empty statements
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) {
        await connection.query(statement);
      }
      console.log('Ran migration:', file);
    }
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
