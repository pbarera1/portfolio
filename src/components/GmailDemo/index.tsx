'use client';
import {useEffect, useState} from 'react';
import styled from 'styled-components';

type Label = {id: string; name: string; type: string};
type Message = {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    internalDate: string;
};

const StyledGmail = styled.div`
    /* latin */
    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Inter Regular'), local('Inter-Regular'),
            url('/inter-regular.woff2') format('woff2'),
            /* Chrome 26+, Opera 23+, Firefox 39+ */ url('/inter-regular.woff')
                format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
    }
    font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans,
        Ubuntu, Cantarell, Helvetica Neue, sans-serif;
`;

// Define the main component.
function GmailDemo() {
    // State to hold the list of Gmail labels.
    const [labels, setLabels] = useState<Label[]>([]);
    // State for the currently selected label ID.
    const [labelId, setLabelId] = useState<string>('INBOX');
    // State for the Gmail search query.
    const [q, setQ] = useState('subject:test newer_than:2d');
    // State to hold the fetched message items.
    const [items, setItems] = useState<[]>([]);
    // State for handling and displaying errors.
    const [err, setErr] = useState<string | null>(null);
    // State to track the loading status.
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Effect to fetch the list of labels on component mount.
    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const response = await fetch('/api/gmail/labels');
                if (response.ok) {
                    const data = await response.json();
                    setLabels(data);
                } else {
                    setErr('Failed to fetch labels. Please Connect Account');
                }
            } catch (e) {
                setErr('Network error while fetching labels.');
            }
        };
        fetchLabels();
    }, []);

    // Function to load the messages based on the selected label and query.
    async function load() {
        setIsLoading(true);
        setErr(null);
        setItems([]);
        try {
            const res = await fetch('/api/gmail/messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({labelId, q, maxResults: 25}),
            });
            if (!res.ok) {
                setErr(`Error: ${res.status} - ${res.statusText}`);
                setItems([]);
                return;
            }
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr('An error occurred while fetching messages.');
        } finally {
            setIsLoading(false);
        }
    }

    // Render the UI with Tailwind CSS classes.
    return (
        <StyledGmail className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 w-full max-w-3xl border border-gray-200">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
                    Gmail CRM Demo
                </h1>

                <a
                    className="flex text-xl text-gray-800 mb-6 text-center"
                    href="/api/google/oauth/start">
                    🔗 Connect Google
                </a>
                {/* Controls section */}
                {labels.length ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                        <select
                            name="label"
                            value={labelId}
                            onChange={(e) => setLabelId(e.target.value)}
                            className="flex-shrink-0 w-full sm:w-auto p-3 border border-gray-300 rounded-lg shadow-sm text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                            {labels.map((l) => (
                                <option key={l.id} value={l.id} className="p-2 text-base">
                                    {l.name}
                                </option>
                            ))}
                        </select>
                        <input
                            name="gmail query"
                            type="text"
                            value={q}
                            disabled={true}
                            // onChange={(e) => setQ(e.target.value)}
                            placeholder="Gmail query (e.g., newer_than:2d)"
                            className="flex-grow w-full p-3 border border-gray-300 rounded-lg shadow-sm text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                        <button
                            onClick={load}
                            disabled={isLoading}
                            className="w-full  px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Loading...' : 'Load Messages'}
                        </button>
                    </div>
                ) : null}

                {/* Error message display */}
                {err && (
                    <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                        {err}
                    </p>
                )}

                {/* Message list display */}
                {items.length > 0 ? (
                    <ul className="space-y-4">
                        {items.map((m: Message) => (
                            <li
                                key={m.id}
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm mb-2">
                                    <span className="font-semibold text-gray-900 truncate max-w-full sm:max-w-[70%]">
                                        {m.from}
                                    </span>
                                    <span className="text-gray-500 text-xs mt-1 sm:mt-0 flex-shrink-0">
                                        {new Date(
                                            Number(m.internalDate),
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">
                                    {m.subject || '(no subject)'}
                                </h3>
                                <p className="text-gray-600 text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                                    {m.snippet}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        {isLoading ? <p>Loading messages...</p> : <p></p>}
                    </div>
                )}
            </div>
        </StyledGmail>
    );
}

export default GmailDemo;
