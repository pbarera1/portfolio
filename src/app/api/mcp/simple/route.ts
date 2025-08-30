// src/app/api/mcp/simple/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400 }
    );
  }

  const { id, method, params } = body as {
    id: number | string | null;
    method: string;
    params?: any;
  };

  try {
    // Initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-03-26',
          serverInfo: { name: 'simple-mcp', version: '0.1.0' },
          capabilities: {
            tools: {}
          },
        },
      });
    }

    // List tools
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'echo',
              description: 'A simple echo tool for testing',
              inputSchema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Message to echo back'
                  }
                },
                required: ['message']
              }
            }
          ]
        }
      });
    }

    // Call tools
    if (method === 'tools/call') {
      const { name, arguments: args } = params ?? {};

      if (name === 'echo') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Echo: ${args?.message || 'No message provided'}`
              }
            ]
          }
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${name}` }
      });
    }

    return NextResponse.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } },
      { status: 400 }
    );
  } catch (e: any) {
    console.error('[Simple MCP] Unhandled error:', e);
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32000, message: e?.message ?? 'Server error' } },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/mcp/simple' });
}
