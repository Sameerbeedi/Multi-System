import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.LANGFLOW_BASE_URL || !process.env.LANGFLOW_API_KEY) {
    return NextResponse.json(
      { error: 'Missing LANGFLOW configuration' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `${process.env.LANGFLOW_BASE_URL}/api/v1/runs/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LANGFLOW_API_KEY}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const run = await response.json()
    return NextResponse.json(run)
  } catch (error) {
    console.error('Error fetching run details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch run details' },
      { status: 500 }
    )
  }
}

