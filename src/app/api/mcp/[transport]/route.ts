// app/api/mcp/[transport]/route.ts
import { z } from 'zod';
import {
  createMcpHandler,
  withMcpAuth,
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from 'mcp-handler';
import {
  logObservation,
  queryObservations,
  isRecentDuplicate,
} from '@/lib/residents';

const handler = createMcpHandler(
  (server) => {
    // Tool: log_observation
    server.tool(
      'log_observation',
      'Insert a resident observation (returns observation id)',
      {
        resident_name: z.string().min(1),
        note: z.string().min(1),
        confirm: z.boolean().optional().default(false), // ask user to confirm
      },
      async ({ resident_name, note, confirm }) => {
        // simple human-in-the-loop: require confirm flag
        if (!confirm) {
          return {
            content: [
              {
                type: 'text',
                text: `About to save: "${note}" for ${resident_name}. Call again with {"confirm": true} to proceed.`,
              },
            ],
          };
        }

        // naive duplicate guard
        if (await isRecentDuplicate(resident_name, note, 10)) {
          return {
            content: [
              {
                type: 'text',
                text: 'Skipped: recent duplicate note detected (last 10 minutes).',
              },
            ],
          };
        }

        const id = await logObservation(resident_name, note);
        return {
          content: [{ type: 'text', text: `Saved. observation_id=${id}` }],
        };
      }
    );

    // Tool: query_observations
    server.tool(
      'query_observations',
      'Fetch recent observations for a resident',
      {
        resident_name: z.string().min(1),
        since_days: z.number().int().min(1).max(365).default(7),
      },
      async ({ resident_name, since_days }) => {
        const rows = await queryObservations(resident_name, since_days);
        return {
          content: [
            {
              type: 'text',
              text:
                rows.length === 0
                  ? `No notes for ${resident_name} in last ${since_days} days.`
                  : JSON.stringify(rows, null, 2),
            },
          ],
        };
      }
    );
  },
  // server options (optional)
  {},
  // adapter options
  {
    basePath: '/api/mcp', // our route lives under /api/mcp/[transport]
    verboseLogs: true,
  }
);

// // OPTIONAL: protect with Bearer token (match ElevenLabs “Secret Token” field)
// const verifyToken = async (req: Request, token?: string) => {
//   if (!token) return undefined;
//   if (token !== process.env.MCP_BEARER_TOKEN) return undefined;
//   return { token, clientId: 'elevenlabs-agent', scopes: ['tools:use'] };
// };

// const authedHandler = process.env.MCP_BEARER_TOKEN
//   ? withMcpAuth(handler, verifyToken, {
//       required: true,
//       requiredScopes: ['tools:use'],
//     })
//   : handler;

// // Export for GET/POST
// export { authedHandler as GET, authedHandler as POST };

// OAuth protected-resource metadata (only needed when auth is enabled)
// No auth wrapper — expose directly
export { handler as GET, handler as POST };
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// .well-known endpoint (Next requires it in a separate file if used)
// app/.well-known/oauth-protected-resource/route.ts
// export const GET = protectedResourceHandler({
//   authServerUrls: ['https://example-auth.local'], // placeholder
// });
// export const OPTIONS = metadataCorsOptionsRequestHandler;
