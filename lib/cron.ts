import cron from 'node-cron';
import fs from 'fs';
import fetch from 'node-fetch';

interface CronJob {
  cronExp: string;
  workflowId: string;
  engine: 'langflow' | 'n8n';
  payload?: Record<string, any>;
}

const JOBS_FILE = './cron_jobs.json';
let jobs: cron.ScheduledTask[] = [];

export const loadCronJobs = () => {
  if (fs.existsSync(JOBS_FILE)) {
    try {
      const jobList: CronJob[] = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
      jobList.forEach(({ cronExp, workflowId, engine, payload }) => {
        const task = cron.schedule(cronExp, () => 
          triggerFlow({
            workflowId,
            engine,
            triggerType: 'schedule',
            inputPayload: payload
          })
        );
        jobs.push(task);
      });
    } catch (error) {
      console.error('Error loading cron jobs:', error);
    }
  }
};

const triggerFlow = async ({
  workflowId,
  engine,
  triggerType,
  inputPayload
}: {
  workflowId: string;
  engine: 'langflow' | 'n8n';
  triggerType: 'schedule';
  inputPayload?: Record<string, any>;
}) => {
  try {
    const response = await fetch('http://localhost:3000/api/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowId,
        engine,
        triggerType,
        inputPayload
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Triggered workflow ${workflowId}:`, result);
  } catch (error) {
    console.error(`Error triggering workflow ${workflowId}:`, error);
  }
};

// Helper function to stop all jobs
export const stopAllJobs = () => {
  jobs.forEach(job => job.stop());
  jobs = [];
};
