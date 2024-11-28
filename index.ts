// Description: This is the main file of the application.
// It is responsible for starting the server and listening to the port.
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import mainRoute from "./routes/mainRoute";
import errorHandler from "./middleware/errorHandler";
import conditionalTokenValidation from "./middleware/conditionalTokenValidation";
import { corsOptions, corsMiddleware } from "./config/corsConfig";
import sessionConfig from "./config/sessionConfig";
import connectDb from "./config/dbConnection";
import routes from "./config/routeConfig";
import limiter from "./middleware/rateLimiter";
import { config } from "./config/config";
import { API_ENDPOINTS } from "./config/endpointsConfig";
import { createServer } from "http";
import { Server } from "socket.io";
require("dotenv").config();

// Create an Express application
const app = express();

// Set the port for the server
const port = process.env.PORT || config.PORT;

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware
corsMiddleware(app);

// Apply session middleware
app.use(sessionConfig);

// Apply token validation middleware conditionally
app.use(conditionalTokenValidation);

// Apply rate limiter middleware
// app.use(limiter);

// Load all routes
Object.values(routes).forEach((route) => {
  app.use(API_ENDPOINTS.MAIN.DEFAULT, route);
});

// Main route of the application
app.use(mainRoute);

// Error handling middleware
app.use(errorHandler);

// Create an HTTP server
const httpServer = createServer(app);

// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Attach the Socket.IO server to the request object
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});

// Start the server and listen on the specified port with the database connection
connectDb()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`${config.SUCCESS.SERVER} ${port}`);
      // you can call here you cron job function
    });
  })
  .catch((error) => {
    console.error(`${config.ERROR.CONNECTION_FAILED}`, error);
  });

export default app;
