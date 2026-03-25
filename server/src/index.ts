import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Yellow Airline API - Despegando...');
});

app.listen(PORT, () => {
  console.log(`Servidor volando en http://localhost:${PORT}`);
});