import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { PORT, CLIENT_URL } from './config/constants';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';

const app = express();
const server = http.createServer(app);

// Initialize real-time WebSocket server
initSocket(server);

// Security & Parsing Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API v1
app.use('/api/v1', routes);

// Serve static client in production if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('HomeBites API Server Running. Client not yet built.');
    }
  });
});

// Centralized error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[HomeBites Server] Listening on http://localhost:${PORT}`);
    console.log(`[HomeBites Server] REST API available at http://localhost:${PORT}/api/v1`);
  });
}

export default app;
