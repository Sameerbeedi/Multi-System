import { NextResponse } from 'next/server'

// Helper to check if response is HTML
function isHtmlResponse(text: string): boolean {
  return text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')
}

interface LoginResponse {
  access_token: string
  token_type: string
}

// Get auth token using login endpoint
async function getAuthToken(baseUrl: string): Promise<string | null> {
  try {
    const url = `${baseUrl}/api/v1/login`
    console.log('Attempting authentication:', { url })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin', // Default username
        password: 'admin'  // Default password
      })
    })
    
    const contentType = response.headers.get('content-type')
    console.log('Auth response:', {
      status: response.status,
      ok: response.ok,
      contentType
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Auth failed:', {
        status: response.status,
        text: errorText.substring(0, 200)
      })
      return null
    }

    if (!contentType?.includes('application/json')) {
      console.error('Invalid content type:', contentType)
      return null
    }

    const data = await response.json() as LoginResponse
    if (!data.access_token) {
      console.error('No access token in response:', data)
      return null
    }

    return data.access_token
  } catch (error) {
    console.error('Auth error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.LANGFLOW_BASE_URL?.trim()
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'LANGFLOW_BASE_URL not configured' },
        { status: 500 }
      )
    }

    const token = await getAuthToken(baseUrl)
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with LangFlow' },
        { status: 401 }
      )
    }

    const response = await fetch(`${baseUrl}/api/v1/flows/runs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Failed to fetch runs: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    if (!data?.runs) {
      return NextResponse.json([])
    }

    const lastRuns = data.runs.slice(0, 50).map((run: any) => ({
      id: run.id,
      flowId: run.flow_id,
      flowName: run.flow_name || 'Untitled Flow',
      status: run.status || 'unknown',
      startTime: run.created_at,
      duration: run.end_time ? 
        (new Date(run.end_time).getTime() - new Date(run.created_at).getTime()) / 1000 
        : null
    }))

    return NextResponse.json(lastRuns)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}