import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Usar DATABASE_URL si existe (producción), sino usar variables individuales (desarrollo)
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
    });

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexión a PostgreSQL establecida con éxito.'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err.stack));

export default pool;