// Punto de entrada del servidor Express
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import personsRouter from './routes/persons';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas — se irán registrando por fase
app.use('/api/auth', authRouter);
app.use('/api/persons', personsRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
