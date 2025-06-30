import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import { authRouter } from './routes/authRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';
import { indicadoresRouter } from './routes/indicadoresRoutes.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/dashboard', protect, dashboardRouter);
app.use('/api/indicadores', protect, indicadoresRouter);

app.use((err, req, res, next) => {
  console.error("ERROR FINAL DETECTADO:", err);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

const PORT = process.env.PORT || 3001;

// CAMBIO: Hacemos que el servidor escuche en '0.0.0.0' y mostramos la IP de red
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
  
  // Lógica para encontrar y mostrar la IP local
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach(ifaceName => {
    networkInterfaces[ifaceName].forEach(iface => {
      // Nos saltamos las direcciones internas (v6) y de loopback
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }
      console.log(`   Accesible en tu red en: http://${iface.address}:${PORT}`);
    });
  });
});