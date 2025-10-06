# Verber - Interactive Verb Learning Platform

A multiplayer educational platform for kids to learn verbs through interactive games and challenges.

## 🚀 Features

- **Interactive Games**: Drag-and-drop exercises and verb conjugation challenges
- **Multiplayer Mode**: Real-time competitions with other players
- **Progress Tracking**: Individual learning progress and statistics
- **Leaderboards**: Global and friend rankings
- **User Profiles**: Personalized learning experience

## 🐳 Quick Start with Docker

### Prerequisites
- **Docker Desktop** installed and running
- **Git** for cloning the repository

### Setup (Windows)
```cmd
git clone <repo-url> verber
cd verber
scripts\setup.bat
```

### Setup (Linux/macOS)
```bash
git clone <repo-url> verber
cd verber
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Docker Setup
```bash
# Create environment file
cp .env.example .env

# Start all services
docker-compose up -d --build

# Check services
docker-compose ps
```

**🎉 Your application will be available at:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ Architecture

### Containerized Services
- **Frontend**: React 18 + TypeScript (Port 3000)
- **Backend**: Go + Gin Framework (Port 8080)
- **Database**: PostgreSQL 15 (Port 5432)
- **Cache**: Redis 7 (Port 6379)

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI, Redux Toolkit
- **Backend**: Go, Gin, GORM, WebSocket, JWT
- **Database**: PostgreSQL with auto-migrations
- **Cache**: Redis for sessions and real-time data
- **Deployment**: Docker containers with multi-stage builds

## 🛠️ Development

### Container Management
```bash
# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart backend

# Access service shell
docker-compose exec backend sh
docker-compose exec postgres psql -U verber_user -d verber_db
docker-compose exec redis redis-cli

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Native Development (Optional)
If you prefer running without Docker:

#### Prerequisites
- Node.js 18+, Go 1.21+, PostgreSQL 15+, Redis

#### Backend Setup
```bash
cd backend
go mod download
cp .env.example .env
go run cmd/server/main.go
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### REST Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/verbs` - Get verb database
- `POST /api/games/create` - Create multiplayer game
- `GET /api/leaderboard` - Get rankings

### WebSocket Events
- `join-game` - Join multiplayer session
- `submit-answer` - Submit verb answer
- `game-update` - Real-time game state

## 🚀 Deployment

### Production with Docker
```bash
# Copy and configure production environment
cp .env.example .env.prod
# Edit .env.prod with production values

# Deploy with production compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Deploy to Railway, Render, or AWS ECS
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Cache**: Use managed Redis (AWS ElastiCache, Redis Cloud)

See `DOCKER.md` for detailed deployment instructions.

## 📝 License

MIT License - feel free to use for educational purposes.