import express, { Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes and middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

class AppServer {
  private app: Express;
  private server: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private port: number;
  private env: string;

  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.env = process.env.NODE_ENV || 'development';
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      })
    );

    // Request logging
    if (this.env !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Custom logger
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', (req: ExpressRequest, res: ExpressResponse) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.env,
      });
    });
  }

  private initializeRoutes(): void {
    // API routes will be added here
    this.app.get('/api', (req: ExpressRequest, res: ExpressResponse) => {
      res.status(200).json({
        message: 'Welcome to HelpingYou API',
        version: '1.0.0',
        environment: this.env,
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      // Add more socket events here
    });
  }

  public start(): void {
    this.initializeSocketIO();

    this.server.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📍 Environment: ${this.env}`);
      console.log(`🔗 API available at http://localhost:${this.port}/api`);
    });
  }

  public getApp(): Express {
    return this.app;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getServer(): ReturnType<typeof createServer> {
    return this.server;
  }
}

export default AppServer;
