// Importar dependências
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Criar aplicação Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos (opcional, se você tiver um frontend)
app.use(express.static('public'));

// Rota inicial
app.get('/', (req, res) => {
  res.send('Bem-vindo ao servidor do Truco Paulista!');
});

// Armazenamento temporário de partidas
const games = {};

// Lógica de comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Um jogador conectado:', socket.id);

  // Entrar em uma sala
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (!games[roomId]) {
      games[roomId] = { players: [], deck: shuffleDeck(), turn: 0 };
    }
    games[roomId].players.push(socket.id);
    io.to(roomId).emit('updateGame', games[roomId]);
  });

  // Lidar com jogadas
  socket.on('playCard', ({ roomId, card }) => {
    const game = games[roomId];
    if (game) {
      game.deck.push(card);
      io.to(roomId).emit('updateGame', game);
    }
  });

  // Lidar com desconexão
  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);
  });
});

// Função para embaralhar o baralho
function shuffleDeck() {
  const suits = ['Copas', 'Espadas', 'Ouros', 'Paus'];
  const values = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

// Iniciar o servidor na porta fornecida pelo Render ou usar 3000 localmente
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
