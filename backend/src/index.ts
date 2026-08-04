import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './api/routes/health';
import { authRouter } from './api/routes/auth';
import { expenseRouter } from './api/routes/expenses';
import { categoryRouter } from './api/routes/categories';
import { queueDashboardRouter } from './api/routes/queueDashboard';
import { errorHandler } from './api/middleware/errorHandler';
import { requireAuth } from './api/middleware/requireAuth';

// Create an Express application
const app = express();
const port = process.env.PORT ?? 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Register routes
app.use(healthRouter);
app.use(authRouter);
app.use(expenseRouter);
app.use(categoryRouter);
app.use('/admin/queues', requireAuth, queueDashboardRouter);

// Must be registered last: catches errors thrown by any route above
app.use(errorHandler);


// Start the server
app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
});
