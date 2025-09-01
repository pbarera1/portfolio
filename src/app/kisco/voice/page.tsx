// app/residents/page.tsx
import {listResidentsWithObservations} from '@/lib/residents';
import styles from '@/app/kisco/voice/voice.module.css';

import Conversation from '@/components/Conversation';
export const dynamic = 'force-dynamic'; // always fresh in dev
export const revalidate = 0;

export default async function ResidentsPage() {
    // Fetch with at most 5 notes per resident (optional)
    const rows = await listResidentsWithObservations({limitPerResident: 5});
    const agentId = process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID!;

    return (
        <main className={`mx-auto max-w-3xl p-6 ${styles.main}`}>
            <h1 className="text-2xl font-semibold mb-4">Voice Conversation</h1>
            <Conversation agentId={agentId} />
            <h2 className="text-2xl font-semibold mb-4">Residents & Observations</h2>

            {rows.length === 0 ? (
                <p className="text-gray-600">No residents found.</p>
            ) : (
                <ul className="space-y-6">
                    {rows.map((r) => (
                        <li key={r.id} className="border rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">{r.name}</h2>
                                <span className="text-sm text-gray-500">
                                    {r.observations?.length ?? 0} note
                                    {(r.observations?.length ?? 0) === 1 ? '' : 's'}
                                </span>
                            </div>

                            {!r.observations || r.observations.length === 0 ? (
                                <p className="text-gray-500 mt-2">No observations yet.</p>
                            ) : (
                                <ol className="mt-3 space-y-2">
                                    {r.observations.map((o) => (
                                        <li
                                            key={o.id}
                                            className="bg-gray-50 rounded-md p-3">
                                            <div className="text-sm text-gray-700">
                                                {o.note}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(o.created_at).toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

// 11labs no custom mcp servers in hippa mode
