// src/app/api/mcp/http/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logObservation, queryObservations } from '@/lib/residents';
import { supabaseAdmin } from '@/lib/supabase';

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
    // 1) Optional but recommended handshake
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-03-26',
          serverInfo: { name: 'nextjs-mcp', version: '0.1.0' },
          capabilities: {},
        },
      });
    }

    // 2) List tools
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'log_observation',
              description:
                'Insert a resident observation (returns observation id). Pass {"confirm": true} to actually save.',
              inputSchema: {
                type: 'object',
                properties: {
                  resident_name: { type: 'string', minLength: 1 },
                  note: { type: 'string', minLength: 1 },
                  confirm: { type: 'boolean', default: false },
                },
                required: ['resident_name', 'note'],
              },
            },
            {
              name: 'query_observations',
              description:
                'Fetch recent observations for a resident. Use before summarizing last N days.',
              inputSchema: {
                type: 'object',
                properties: {
                  resident_name: { type: 'string', minLength: 1 },
                  since_days: { type: 'number', minimum: 1, maximum: 365, default: 7 },
                },
                required: ['resident_name'],
              },
            },
          ],
        },
      });
    }

    // 3) Call tools
    if (method === 'tools/call') {
      const { name, arguments: args } = params ?? {};

      if (name === 'log_observation') {
        const schema = z.object({
          resident_name: z.string().min(1),
          note: z.string().min(1),
          confirm: z.boolean().optional().default(false),
        });
        const parsed = schema.safeParse(args);
        if (!parsed.success) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params', data: parsed.error.errors },
          });
        }
        const { resident_name, note, confirm } = parsed.data;

        if (!confirm) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `About to save: "${note}" for ${resident_name}. Call again with {"confirm": true} to proceed.`,
                },
              ],
            },
          });
        }

        // ✅ duplicate guard: join residents so filter on residents.name works
        try {
          const sb = supabaseAdmin();
          const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
          const { data: dup, error: dupErr } = await sb
            .from('observations')
            .select('id, residents!inner(name)')
            .eq('residents.name', resident_name)
            .eq('note', note)
            .gte('created_at', cutoff)
            .limit(1);
          if (dupErr) throw dupErr;
          if ((dup?.length ?? 0) > 0) {
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: 'Skipped: recent duplicate note (10 min).' }],
              },
            });
          }
        } catch (e) {
          console.warn('[dup check] continuing despite error:', e);
        }

        const obsId = await logObservation(resident_name, note);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: `Saved. observation_id=${obsId}` }] },
        });
      }

      if (name === 'query_observations') {
        const schema = z.object({
          resident_name: z.string().min(1),
          since_days: z.number().int().min(1).max(365).default(7),
        });
        const parsed = schema.safeParse(args);
        if (!parsed.success) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params', data: parsed.error.errors },
          });
        }
        const { resident_name, since_days } = parsed.data;

        // Query with inner join to filter by resident name
        const sb = supabaseAdmin();
        const { data, error } = await sb
          .from('observations')
          .select('id, note, created_at, residents!inner(name)')
          .eq('residents.name', resident_name)
          .gte('created_at', new Date(Date.now() - since_days * 86_400_000).toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32603, message: 'Internal error', data: error.message },
          });
        }

        const rows = data ?? [];
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text:
                  rows.length === 0
                    ? `No notes for ${resident_name} in last ${since_days} days.`
                    : JSON.stringify(rows, null, 2),
              },
            ],
          },
        });
      }

      // Unknown tool
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      });
    }

    // Unknown method
    return NextResponse.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } },
      { status: 400 }
    );
  } catch (e: any) {
    console.error('[MCP HTTP] Unhandled error:', e);
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32000, message: e?.message ?? 'Server error' } },
      { status: 500 }
    );
  }
}

// Optional browser health check (GET)
export function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/mcp/http' });
}
