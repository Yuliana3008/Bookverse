import pkg from "pg";
import dotenv from "dotenv"; // Importamos dotenv

dotenv.config(); // Cargamos las variables del .env

const { Pool } = pkg;

// Usamos process.env para acceder a las variables del .env
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexión a PostgreSQL (Pool) establecida con éxito.'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err.stack));

// Exportamos el Pool para usarlo en otros archivos
export default pool;