import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import expressLayouts from 'express-ejs-layouts';

import dashboardRoutes from './routes/dashboard.routes.js';
import productosRoutes from './routes/productos.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import movimientosRoutes from './routes/movimientos.routes.js';
import reportesRoutes from './routes/reportes.routes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Layouts (ANTES de las rutas)
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Rutas
app.use('/dashboard', dashboardRoutes);
app.use('/productos', productosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/movimientos', movimientosRoutes);
app.use('/reportes', reportesRoutes);


app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
