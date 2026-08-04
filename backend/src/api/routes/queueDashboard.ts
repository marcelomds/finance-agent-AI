import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { allQueues } from '../../services/queue/queues';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: allQueues.map((queue) => new BullAdapter(queue)),
  serverAdapter,
});

export const queueDashboardRouter = serverAdapter.getRouter();
