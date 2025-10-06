# Verber Project Setup Instructions

## 🚀 Quick Start

### Prerequisites
- **Go** 1.21+ installed
- **Node.js** 18+ and npm installed
- **PostgreSQL** 15+ running
- **Redis** server running (optional for development)

### Backend Setup (Go)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   go mod tidy
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run the server**:
   ```bash
   go run cmd/server/main.go
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup (React)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Update API URLs if needed
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## 📁 Project Structure

```
verber/
├── backend/                 # Go backend
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Private application code
│   │   ├── config/        # Configuration
│   │   ├── database/      # Database setup
│   │   ├── handlers/      # HTTP handlers
│   │   ├── middleware/    # HTTP middleware
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── websocket/     # WebSocket handlers
│   ├── .env.example       # Environment template
│   ├── Dockerfile         # Container configuration
│   ├── go.mod             # Go modules
│   └── railway.toml       # Railway deployment config
└── frontend/               # React frontend
    ├── public/            # Static assets
    ├── src/               # Source code
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── store/         # Redux store
    │   └── App.tsx        # Main app component
    ├── .env.example       # Environment template
    ├── package.json       # Dependencies
    ├── tsconfig.json      # TypeScript config
    └── vercel.json        # Vercel deployment config
```

## 🛠️ Development Workflow

### Running Both Services
```bash
# Terminal 1: Backend
cd backend && go run cmd/server/main.go

# Terminal 2: Frontend  
cd frontend && npm start
```

### Database Setup
1. Create PostgreSQL database named `verber_db`
2. Update `DATABASE_URL` in backend `.env`
3. The application will auto-migrate tables on startup

### Features Implemented

#### Backend ✅
- [x] REST API with Gin framework
- [x] WebSocket support for real-time multiplayer
- [x] JWT authentication
- [x] PostgreSQL database with GORM
- [x] User management and progress tracking
- [x] Game creation and management
- [x] Verb database with exercises
- [x] Leaderboard system

#### Frontend ✅
- [x] React with TypeScript
- [x] Material-UI component library
- [x] Redux Toolkit for state management
- [x] React Router for navigation
- [x] Axios for API calls
- [x] WebSocket client setup
- [x] Responsive design structure

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy via Vercel CLI or GitHub integration
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy via Railway CLI or GitHub integration
# Update frontend environment variables with backend URL
```

## 📝 Next Steps

### Immediate Development Tasks
1. **Complete Authentication UI** - Login/Register forms
2. **Game Components** - Drag-and-drop interfaces
3. **WebSocket Integration** - Real-time multiplayer
4. **Exercise Types** - Different game modes
5. **Progress Visualization** - Charts and statistics

### Advanced Features
1. **Audio Support** - Verb pronunciation
2. **Difficulty Scaling** - Adaptive learning
3. **Social Features** - Friend system
4. **Mobile App** - React Native version
5. **Analytics** - Learning insights

## 🐛 Troubleshooting

### Common Issues
- **Module not found**: Run `go mod tidy` and `npm install`
- **Database connection**: Check PostgreSQL is running and credentials
- **CORS errors**: Verify frontend URL in backend CORS config
- **Port conflicts**: Change ports in environment files

### Dependencies Installation
If you encounter module errors, install the packages:

```bash
# Backend
cd backend
go mod download

# Frontend
cd frontend
npm install
```

The project is now ready for development! 🎉