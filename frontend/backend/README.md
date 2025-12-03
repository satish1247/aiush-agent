# Aiush Agent Backend

Node.js + Express + MongoDB backend for Aiush Agent.

## Setup

1.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend/` directory based on `.env.example`.
    ```
    MONGO_URI=mongodb+srv://...
    JWT_SECRET=...
    API_KEY=...
    ```

3.  **Run Server**:
    ```bash
    # Development mode (auto-restart)
    npm run dev
    
    # Production
    npm start
    ```

## API Endpoints

### Auth
- `POST /auth/signup` - { name, email, password }
- `POST /auth/login` - { email, password }
- `GET /auth/me` - (Requires Token)

### History
- `POST /history/add` - { message, ai_response, type } (Requires Token)
- `GET /history/get` - (Requires Token)
- `DELETE /history/clear` - (Requires Token)

### AI
- `POST /aiush/query` - { text, image, history }

## Deployment

**Render / Vercel**:
- Set the Root Directory to `backend/`.
- Add Environment Variables in the dashboard.
- Build Command: `npm install`.
- Start Command: `node server.js`.
