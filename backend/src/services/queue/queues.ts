import { expenseQueue } from './expenseQueue';

// Central registry: every Bull queue in the app gets listed here once.
// Adding a new queue later (e.g. bank reconciliation, notifications) is just:
//   1. Create the queue in its own file (see expenseQueue.ts as the template)
//   2. Import + add it to this array
// The dashboard (queueDashboard.ts) and any future shutdown/health-check code
// read from this single list instead of being edited per-queue.
export const allQueues = [expenseQueue];
