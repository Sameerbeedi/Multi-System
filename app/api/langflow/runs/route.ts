import { NextResponse } from 'next/server'

interface LoginResponse {
  access_token: string
  token_type: string
}

async function getAuthToken(baseUrl: string): Promise<string | null> {
  try {
    // First try using API key
    const apiKey = process.env.LANGFLOW_API_KEY?.trim()
    if (apiKey) {
      // Validate API key
      const validateResponse = await fetch(`${baseUrl}/api/v1/validate`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      })
      if (validateResponse.ok) {
        return apiKey
      }
    }

    // Fallback to username/password auth
    const loginResponse = await fetch(`${baseUrl}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: process.env.LANGFLOW_USERNAME || 'admin',
        password: process.env.LANGFLOW_PASSWORD || 'admin'
      })
    })

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error('Login failed:', {
        status: loginResponse.status,
        error: errorText
      })
      return null
    }

    const data = await loginResponse.json() as LoginResponse
    return data.access_token
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function GET() {
  const baseUrl = process.env.LANGFLOW_BASE_URL?.trim()
  
  if (!baseUrl) {
    return NextResponse.json(
      { error: 'LANGFLOW_BASE_URL not configured' },
      { status: 500 }
    )
  }

  try {
    const token = await getAuthToken(baseUrl)
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with LangFlow' },
        { status: 401 }
      )
    }

    const runsResponse = await fetch(`${baseUrl}/api/v1/flows/runs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!runsResponse.ok) {
      const error = await runsResponse.text()
      console.error('Failed to fetch runs:', {
        status: runsResponse.status,
        error
      })
      return NextResponse.json(
        { error: `Failed to fetch runs: ${error}` },
        { status: runsResponse.status }
      )
    }

    const data = await runsResponse.json()
    const runs = data?.runs || []
    
    const lastRuns = runs.slice(0, 50).map((run: any) => ({
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