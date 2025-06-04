import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  if (!params?.workflowId) {
    return NextResponse.json({ error: 'Missing workflow ID' }, { status: 400 });
  }

  try {
    // Ensure environment variables are set
    const baseUrl = process.env.LANGFLOW_BASE_URL;
    const apiKey = process.env.LANGFLOW_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Missing Langflow configuration');
    }

    const body = await request.json();
    
    // Call Langflow API directly for webhook triggers
    const response = await fetch(`${baseUrl}/api/v1/flows/${params.workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    }).catch(err => {
      console.error('Fetch error:', err);
      throw new Error(`Connection failed: ${err.message}`);
    });

    if (!response.ok) {
      throw new Error(`Langflow API error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Webhook trigger failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}