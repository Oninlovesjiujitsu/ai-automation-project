import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Determine the backend URL (docker vs local development)
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8001';
    
    const response = await fetch(`${backendUrl}/api/stream-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    // Proxy the readable stream back to the client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error forwarding stream to backend:', error);
    return NextResponse.json(
      { error: 'Failed to connect to streaming backend' },
      { status: 500 }
    );
  }
}
