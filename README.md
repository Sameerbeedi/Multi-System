# Flowbit Workflow Orchestration

A powerful workflow orchestration system integrating LangFlow and N8N for automated task management and execution.

## Features

- **LangFlow Integration**
  - Workflow execution via API
  - Run history tracking
  - Authentication handling
  - Webhook support for automated triggers

- 

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- LangFlow instance running
- N8N instance (optional)

## Environment Setup

Create a `.env.local` file in the project root:

```bash
# LangFlow Configuration
LANGFLOW_BASE_URL=http://localhost:7860
LANGFLOW_API_KEY=your_api_key_here
LANGFLOW_USERNAME=admin
LANGFLOW_PASSWORD=admin

# N8N Configuration (optional)
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flowbit-workflow-orchestration.git
cd flowbit-workflow-orchestration
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### LangFlow Runs

```http
GET /api/langflow/runs
```
Returns a list of the most recent workflow runs.

**Response Format:**
```json
[
  {
    "id": "run_id",
    "flowId": "flow_id",
    "flowName": "Example Flow",
    "status": "completed",
    "startTime": "2024-03-06T10:00:00Z",
    "duration": 23.5
  }
]
```

### Webhook Triggers

```http
POST /api/hooks/{workflowId}
```
Triggers a specific workflow via webhook.

**Request Body:**
```json
{
  "input": "Your workflow input here"
}
```

## Authentication

The system supports two authentication methods for LangFlow:

1. API Key Authentication (Recommended)
   - Set `LANGFLOW_API_KEY` in your environment
   - Used as Bearer token in requests

2. Username/Password Authentication (Fallback)
   - Uses `LANGFLOW_USERNAME` and `LANGFLOW_PASSWORD`
   - Automatically handles token management

## Error Handling

The API implements comprehensive error handling:

- Authentication failures (401)
- Configuration errors (500)
- API connection issues (502)
- Invalid responses (400)
- Resource not found (404)

## Development

### Project Structure

```
flowbit-workflow-orchestration/
├── app/
│   ├── api/
│   │   ├── langflow/
│   │   │   └── runs/
│   │   │       └── route.ts
│   │   └── hooks/
│   │       └── [workflowId]/
│   │           └── route.ts
│   └── ...
├── .env.local
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Docker Setup

### Docker Compose Configuration

Create a `docker-compose.yml` file in your project root:

```yaml

version: '3.8'

services:
  langflow:
    image: logspace/langflow:latest
    ports:
      - "7860:7860"
    environment:
      - LANGFLOW_AUTO_LOGIN=false
      - LANGFLOW_USERNAME=admin
      - LANGFLOW_PASSWORD=admin
    volumes:
      - langflow_data:/data

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    volumes:
      - n8n_data:/home/node/.n8n

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - LANGFLOW_BASE_URL=http://langflow:7860
      - N8N_BASE_URL=http://n8n:5678
    depends_on:
      - langflow
      - n8n

volumes:
  langflow_data:
  n8n_data:
```

### Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
// filepath: d:\Users\sameer\Downloads\flowbit-workflow-orchestration\Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Building and Running with Docker

1. Build the containers:
```bash
docker compose build
```

2. Start the services:
```bash
docker compose up -d
```

3. Check the logs:
```bash
docker compose logs -f
```

4. Stop the services:
```bash
docker compose down
```

### Container Management

- Restart a specific service:
```bash
docker compose restart langflow
```

- View service status:
```bash
docker compose ps
```

- Check service logs:
```bash
docker compose logs -f langflow
```

### Development with Docker

For development, you can use volume mounts to enable hot reloading:

```yaml
// Add to app service in docker-compose.yml
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

### Environment Variables

When using Docker Compose, environment variables can be set in:
1. `.env` file in project root
2. `docker-compose.yml` environment section
3. Command line using `docker compose --env-file custom.env up`
4. Add the api url and api key to the .env.local file

