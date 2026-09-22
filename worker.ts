import cron from 'node-cron';
import { runPipeline } from './src/lib/pipeline';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for the standalone worker
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Starting AI News Aggregator Cron Worker...');
console.log('Schedules set for: 07:00 AM and 19:45 (7:45 PM) every day.');

// Run at 7:00 AM every day
cron.schedule('0 7 * * *', async () => {
  console.log('[Cron Worker] Triggering morning run (7:00 AM)...');
  await runPipeline();
}, {
  timezone: "America/New_York" // Change this to your local timezone if needed
});

// Run at 7:45 PM every day
cron.schedule('45 19 * * *', async () => {
  console.log('[Cron Worker] Triggering evening run (7:45 PM)...');
  await runPipeline();
}, {
  timezone: "America/New_York"
});

console.log('Worker is now running in the background. Press Ctrl+C to exit.');

// Keep the process alive
process.stdin.resume();
