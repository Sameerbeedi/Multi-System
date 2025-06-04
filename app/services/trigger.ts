interface WorkflowTriggerParams {
  workflowId: string;
  engine: 'langflow' | 'n8n';
  triggerType: 'manual' | 'webhook' | 'schedule';
  inputPayload?: Record<string, any>;
}

export async function triggerWorkflow(params: WorkflowTriggerParams) {
  try {
    const response = await fetch('/api/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering workflow:', error);
    throw error;
  }
}