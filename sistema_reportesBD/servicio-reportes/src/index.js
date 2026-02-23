import express from 'express';
import dotenv from 'dotenv';
import reportesRoutes from './routes/reportes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/reportes', reportesRoutes);

app.listen(8081, () => {
  console.log('Servicio de reportes corriendo en puerto 8081');
});