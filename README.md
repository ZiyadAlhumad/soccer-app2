## How to Run

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```text
MONGO_URI=your_mongodb_connection_link
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Run the seed file one time to create demo users and stadium data:

```bash
node seed.js
```

Start the backend:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```
