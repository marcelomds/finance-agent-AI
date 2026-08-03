import express from 'express';
import { healthRouter } from './api/routes/health';

const app = express();
const port = process.env.PORT ?? 3000;

// Register routes
app.use(healthRouter);


// Start the server
app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
});
