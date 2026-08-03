import express from 'express';
import cors from 'cors';
import { healthRouter } from './api/routes/health';
import { expenseRouter } from './api/routes/expenses';
import { categoryRouter } from './api/routes/categories';
import { errorHandler } from './api/middleware/errorHandler';

// Create an Express application
const app = express();
const port = process.env.PORT ?? 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Register routes
app.use(healthRouter);
app.use(expenseRouter);
app.use(categoryRouter);

// Must be registered last: catches errors thrown by any route above
app.use(errorHandler);


// Start the server
app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
});
