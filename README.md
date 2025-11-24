# Agentic AI Backend

A Node.js backend service with AI agents powered by Google Gemini and LangChain.

## Prerequisites

- Docker Desktop (for containerized deployment)
- Node.js 20+ (for local development)
- MongoDB (for local development)

## Getting Started

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `LANGSMITH_API_KEY`: Your LangSmith API key (optional)
- `JWT_SECRET`: A secure random string for JWT signing
- `MONGO_URI`: MongoDB connection string (see below)

### 2. Running with Docker (Recommended)

**Start the application with MongoDB:**

```bash
docker-compose up -d
```

**View logs:**

```bash
docker-compose logs -f
```

**Stop the application:**

```bash
docker-compose down
```

**Note:** The `MONGO_URI` in your `.env` should use the service name from docker-compose:
```
MONGO_URI=mongodb://admin:password@mongo:27017/agentic_ai?authSource=admin
```

### 3. Running Locally (Development)

**Install dependencies:**

```bash
npm install
```

**Update `.env` for local MongoDB:**
```
MONGO_URI=mongodb://127.0.0.1:27017/agentic-ai
```

**Start the server:**

```bash
npm run dev
```

The server will run at `http://localhost:5000`

## Docker Commands

**Build the image manually:**

```bash
docker build -t agentic-ai-backend .
```

**Run a single container (requires external MongoDB):**

```bash
docker run --rm --env-file .env -p 5000:5000 agentic-ai-backend
```

**Access the MongoDB container:**

```bash
docker exec -it agentic-ai-mongo mongosh -u admin -p password
```

## API Endpoints

### Public Routes (No Authentication)
- `GET /` - Health check
- `POST /api/public/*` - Public endpoints

### Protected Routes (Require JWT)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/ai/*` - AI agent endpoints

## Project Structure

```
├── ai/                 # AI agents and services
│   ├── agents/        # Agent implementations
│   ├── functions/     # Tool functions
│   ├── llm/          # LLM clients and configs
│   └── prompts/      # Prompt templates
├── config/            # Configuration files
├── controllers/       # Route controllers
├── middleware/        # Express middleware
├── models/           # Mongoose models
├── routes/           # Route definitions
└── utils/            # Utility functions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `LANGSMITH_API_KEY` | LangSmith API key | No |

## Troubleshooting

### MongoDB Connection Issues

**Error: `connect ECONNREFUSED 127.0.0.1:27017`**
- When using Docker, ensure `MONGO_URI` uses `mongo` as the host (not `127.0.0.1`)
- Make sure MongoDB container is running: `docker ps`

**Error: `The 'uri' parameter to 'openUri()' must be a string, got "undefined"`**
- Check that `.env` file exists and contains `MONGO_URI`
- Verify environment variables are loaded: `docker-compose config`

### Docker Desktop Issues

**Error: `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`**
- Start Docker Desktop and wait for it to fully initialize
- Check Docker is running: `docker --version` and `docker info`

## License

ISC
