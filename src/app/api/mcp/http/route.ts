// src/app/api/mcp/http/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logObservation, queryObservations } from '@/lib/residents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type JReq = { jsonrpc: '2.0'; id: number | string | null; method: string; params?: any };
type JResOk = { jsonrpc: '2.0'; id: JReq['id']; result: any };
type JResErr = { jsonrpc: '2.0'; id: JReq['id']; error: { code: number; message: string; data?: any } };
type JRes = JResOk | JResErr;

const ok = (id: JReq['id'], result: any): JResOk => ({ jsonrpc: '2.0', id, result });
const err = (id: JReq['id'], code: number, message: string, data?: any): JResErr => ({
  jsonrpc: '2.0', id, error: { code, message, data },
});

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  const raw = await req.text(); // <-- read raw first so we can log even if parse fails
  console.log('[MCP] POST', req.nextUrl.pathname, 'CT=', ct);
  console.log('[MCP] Raw:', raw.slice(0, 1024));

  let parsed: unknown;
  try {
    parsed = raw.length ? JSON.parse(raw) : {};
  } catch (e: any) {
    return NextResponse.json(err(null, -32700, 'Parse error', { rawSnippet: raw.slice(0, 200) }), {
      status: 400,
    });
  }

  // JSON-RPC may be a single object or a batch array
  const requests: JReq[] = Array.isArray(parsed) ? parsed : [parsed as JReq];

  const responses: JRes[] = await Promise.all(
    requests.map(async (r) => {
      const { id, method, params } = r ?? {};
      try {
        if (!method) return err(id ?? null, -32600, 'Invalid Request'); // missing method

        // --- initialize (recommended) ---
        if (method === 'initialize') {
          return ok(id, {
            protocolVersion: '2025-03-26',
            serverInfo: { name: 'nextjs-mcp', version: '0.1.0' },
            capabilities: {},
          });
        }

        // --- tools/list ---
        if (method === 'tools/list') {
          return ok(id, {
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
                  'Fetch recent observations for a resident. Use this before summarizing last N days.',
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
          });
        }

        // --- tools/call ---
        if (method === 'tools/call') {
          const toolName = params?.name as string | undefined;
          const args = params?.arguments ?? {};

          if (!toolName) return err(id, -32602, 'Invalid params: missing name');

          if (toolName === 'log_observation') {
            const schema = z.object({
              resident_name: z.string().min(1),
              note: z.string().min(1),
              confirm: z.boolean().optional().default(false),
            });
            const parsedArgs = schema.safeParse(args);
            if (!parsedArgs.success) return err(id, -32602, 'Invalid params', parsedArgs.error.errors);
            const { resident_name, note, confirm } = parsedArgs.data;

            if (!confirm) {
              return ok(id, {
                content: [
                  {
                    type: 'text',
                    text: `About to save: "${note}" for ${resident_name}. Call again with {"confirm": true} to proceed.`,
                  },
                ],
              });
            }

            const obsId = await logObservation(resident_name, note);
            return ok(id, { content: [{ type: 'text', text: `Saved. observation_id=${obsId}` }] });
          }

          if (toolName === 'query_observations') {
            const schema = z.object({
              resident_name: z.string().min(1),
              since_days: z.number().int().min(1).max(365).default(7),
            });
            const parsedArgs = schema.safeParse(args);
            if (!parsedArgs.success) return err(id, -32602, 'Invalid params', parsedArgs.error.errors);
            const { resident_name, since_days } = parsedArgs.data;

            const rows = await queryObservations(resident_name, since_days);
            return ok(id, {
              content: [
                {
                  type: 'text',
                  text:
                    rows.length === 0
                      ? `No notes for ${resident_name} in last ${since_days} days.`
                      : JSON.stringify(rows, null, 2),
                },
              ],
            });
          }

          return err(id, -32601, `Unknown tool: ${toolName}`);
        }

        // Unknown method
        return err(id, -32601, `Method not found: ${method}`);
      } catch (e: any) {
        console.error('[MCP] Handler error:', e);
        return err(id, -32000, 'Server error', e?.message ?? String(e));
      }
    })
  );

  // If batch in, batch out; otherwise single object
  const bodyOut = Array.isArray(parsed) ? responses : responses[0];
  return NextResponse.json(bodyOut);
}

// Optional quick GET for your own browser check
export function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/mcp/http' });
}
