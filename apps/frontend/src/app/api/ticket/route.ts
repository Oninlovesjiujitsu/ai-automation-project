import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Proxy the request to the local n8n webhook
    const response = await fetch('http://127.0.0.1:5678/webhook/support-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error forwarding to n8n webhook:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with escalation engine' },
      { status: 500 }
    );
  }
}
