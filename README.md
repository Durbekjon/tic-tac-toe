# Real-time Multiplayer Tic-Tac-Toe

A modern, real-time multiplayer Tic-Tac-Toe game built with Angular and NestJS, featuring WebSocket communication for live gameplay.

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

## 🔧 Development

### Project Structure

```
battle-game/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── game/      # Game components
│   │   │   └── shared/    # Shared components
│   │   └── environments/  # Environment configs
├── src/                   # NestJS backend
│   ├── game/             # Game logic
│   └── shared/           # Shared constants
├── shared/               # Shared types
└── docker/              # Docker configuration
```

### Running Tests

```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

## 📦 Deployment

The application is configured for deployment on Render.com using Docker containers. The deployment process is automated through GitHub Actions.

### Manual Deployment

1. Build the application:
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ..
npm run build
```

2. Run using Docker:
```bash
docker build -t battle-game .
docker run -p 3000:3000 battle-game
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Angular team for the amazing framework
- NestJS team for the powerful backend framework
- The open-source community for inspiration and support
