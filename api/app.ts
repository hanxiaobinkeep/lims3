import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// health
app.use('/api/health', (req: Request, res: Response): void => {
  res.status(200).json({ code: 200, message: 'ok', data: null });
});

// error handler middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ code: 404, message: 'API not found', data: null });
});

export default app;
