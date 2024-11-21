# Battle Game - Multiplayer Tic-Tac-Toe

A real-time multiplayer Tic-Tac-Toe game built with Angular and NestJS.

## Author

**Durbek Saydaliyev**

## Description

This is a modern implementation of the classic Tic-Tac-Toe game, featuring:
- Real-time multiplayer gameplay using WebSockets
- Beautiful, responsive UI with Angular Material
- Robust backend powered by NestJS
- Player matchmaking and game state management
- Live game updates and notifications

## 🎮 Features

- Real-time multiplayer gameplay
- Live player status updates
- Game invitation system
- Interactive game board with animations
- Responsive design for all devices
- Turn-based gameplay with live updates
- Win/draw detection
- Player list with online status

## 🛠 Tech Stack

- **Frontend:**
  - Angular 18
  - Angular Material
  - Socket.IO Client
  - RxJS
  - TypeScript

- **Backend:**
  - NestJS
  - Socket.IO
  - TypeScript

- **DevOps:**
  - Docker
  - GitHub Actions
  - Render.com deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd battle-game
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. Set up environment variables:
```bash
# Copy example environment file
cp .env.example .env
```

4. Start the development servers:

```bash
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend
cd client
npm start
```

5. Open your browser and navigate to `http://localhost:4200`

## 🎯 Game Rules

1. Two players take turns marking spaces on a 3x3 grid
2. First player uses "X", second player uses "O"
3. First player to get three in a row (horizontally, vertically, or diagonally) wins
4. If all spaces are filled and no player has won, the game is a draw

## 🌐 Deployment

The game is currently deployed and accessible at:
- Frontend: https://tic-tac-toe-ij1b.onrender.com
- Backend WebSocket: wss://tic-tac-toe-ij1b.onrender.com

### Environment Variables

The following environment variables are required for deployment:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# WebSocket Configuration
WS_PORT=3000
WS_HOST=tic-tac-toe-ij1b.onrender.com
WS_PATH=/socket.io

# CORS Configuration
CORS_ORIGIN=https://tic-tac-toe-ij1b.onrender.com

# Game Configuration
MAX_PLAYERS_PER_GAME=2
GAME_TIMEOUT_SECONDS=300
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Acknowledgments

- Angular team for the amazing framework
- NestJS team for the powerful backend framework
- The open-source community for inspiration and support

## Copyright

 2024 Durbek Saydaliyev. All rights reserved.
