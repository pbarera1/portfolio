'use client';
import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import Link from 'next/link';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        Translator: any;
    }

    const Translator: any;
}

// Define the main App component, which will be the default export.
function SpeechApp() {
    // State to hold the transcribed text from the speech recognition.
    const [transcript, setTranscript] = useState('');
    // State to track if the microphone is currently listening.
    const [isListening, setIsListening] = useState(false);
    // State to hold the translated text.
    const [translatedText, setTranslatedText] = useState('');
    // State for managing the loading state during translation.
    const [isTranslating, setIsTranslating] = useState(false);
    // State to hold the user's selected target language code.
    const [targetLanguage, setTargetLanguage] = useState('es');
    // State for handling any potential errors.
    const [error, setError] = useState<string | null>(null);
    // State to track if the translated text is currently being spoken.
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [voiceName, setVoiceName] = useState<string | null>(null);

    // Reference to the SpeechRecognition object.
    // We use useRef to persist the object across re-renders.
    const recognitionRef = React.useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // load voices reliably
    useEffect(() => {
        const load = () => {
            const v = window.speechSynthesis.getVoices();
            if (v && v.length) setVoices(v);
        };
        load(); // try once (Chrome sometimes already has them)
        window.speechSynthesis.onvoiceschanged = load;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // useEffect hook to initialize the Web Speech API.
    useEffect(() => {
        // Check if the browser supports the Web Speech API.
        // Use window.webkitSpeechRecognition for Chrome/Safari support.
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        // If the API is not supported, set an error message.
        if (!SpeechRecognition) {
            setError(
                'Web Speech API is not supported in this browser. Please use Chrome or Safari.',
            );
            return;
        }

        // Create a new SpeechRecognition instance.
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Set the default language for recognition.
        recognition.interimResults = false; // Only return final results.
        recognition.continuous = true; // Stop listening after one phrase.

        // Event handler for when a result is received.
        recognition.onresult = (event: any) => {
            // Get the last transcription result.
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;

            console.log(text);
            if (text.trim() === 'close program') {
                setIsListening(false);
            } else {
                setTranscript((prevText) => prevText + text + '.');
            }
            // Reset the listening state.
            // setIsListening(false);
        };

        // Event handler for when the recognition ends.
        recognition.onend = () => {
            // setIsListening(false);
        };

        // Event handler for when an error occurs.
        recognition.onerror = (event: any) => {
            // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        // Store the recognition object in the ref.
        recognitionRef.current = recognition;

        // Cleanup function to stop the recognition if the component unmounts.
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Function to start or stop listening.
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            console.log('clear it out');
            setTranscript('');
            setTranslatedText('');
            setError(null);
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                setError('Microphone access denied or already in use.');
                setIsListening(false);
            }
        }
    };

    // Function to handle the translation process.
    const handleTranslate = async () => {
        // Do not translate if transcript is empty or already translating.
        if (!transcript.trim() || isTranslating) {
            return;
        }

        setIsTranslating(true);
        setTranslatedText('');

        try {
            // This is a simulated translation API call.
            // In a real app, you would make an API call to a service like Google Translate.
            const translated = await simulateTranslation(transcript, targetLanguage);
            setTranslatedText(translated);
        } catch (err) {
            // Handle potential translation errors.
            setError('Translation failed. Please try again.');
        } finally {
            setIsTranslating(false);
        }
    };

    // Simulated translation function.
    // Provides a placeholder for a real API call.
    const simulateTranslation = async (text: string, lang: string): Promise<string> => {
        const translator = await Translator.create({
            sourceLanguage: 'en',
            targetLanguage: targetLanguage,
        });
        const translation = await translator.translate(text);

        let result = text;
        switch (lang) {
            case 'es':
                result = translation;
                break;
            case 'fr':
                result = translation;
                break;
            case 'de':
                result = translation;
                break;
            case 'ja':
                result = translation;
                break;
            default:
                result = translation;
                break;
        }
        return Promise.resolve(result);
    };

    // Function to speak the translated text.
    const speakTranslatedText = () => {
        if (!translatedText.trim() || isSpeaking) {
            return;
        }

        // Check for browser support
        if (!('speechSynthesis' in window)) {
            setError('Text-to-speech not supported in this browser.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.lang = targetLanguage;

        // Find a higher-quality voice. Different browsers and operating systems
        // will have different voices available. Look for voices with 'Google',
        // 'Microsoft', or 'Premium' in the name for better options.
        const preferredVoice = voices.find((voice) => {
            return voiceName && voice.name.includes(voiceName);
        });

        // If a preferred voice is found, set it
        if (preferredVoice) {
            console.log(preferredVoice);
            utterance.voice = preferredVoice;
        } else {
            console.warn('Preferred voice not found. Using default.');
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            setError(`Speech synthesis error: ${event.error}`);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // UI rendering with Tailwind CSS classes.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 w-full max-w-xl space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
                    Test Web Speech & Translator API
                </h1>

                {/* Input Text Area (for transcribed speech) */}
                <div className="space-y-2">
                    <label
                        htmlFor="transcript"
                        className="text-gray-600 font-semibold text-lg">
                        Your Speech:
                    </label>
                    <textarea
                        id="transcript"
                        className="w-full h-32 p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none"
                        readOnly
                        value={transcript}
                        placeholder={
                            isListening
                                ? 'Listening...'
                                : 'Click the microphone to speak.'
                        }
                    />
                </div>

                {/* Action Buttons and Language Selector */}
                <div className="flex flex-col gap-4 items-start justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={toggleListening}
                        className={`w-full sm:w-auto px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 transform ${
                            isListening
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={!!error}>
                        {isListening ? (
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zM5 10a5 5 0 0010 0v-2a1 1 0 012 0v2a7 7 0 01-14 0v-2a1 1 0 012 0v2zM4 16h12a1 1 0 110 2H4a1 1 0 010-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Stop Listening</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                        d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 15.011a5.992 5.992 0 01-.659-.138 6.001 6.001 0 01-1.359-4.321 6 6 0 0110.894-4.847 8 8 0 00-7.393 7.643zM14 17a1 1 0 01-1-1v-2.172a5.989 5.989 0 01-1-.417V15a3 3 0 11-6 0v-2.172c-.22-.054-.44-.112-.659-.138A5.992 5.992 0 018 10a6 6 0 017 5.143V17a1 1 0 01-1 1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Start Listening</span>
                            </div>
                        )}
                    </button>

                    <div className="flex-grow flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="ja">Japanese</option>
                        </select>

                        <button
                            onClick={handleTranslate}
                            className={`w-full sm:w-auto px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 transform ${
                                !transcript.trim() || isTranslating
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                            disabled={!transcript.trim() || isTranslating}>
                            {isTranslating ? 'Translating...' : 'Translate'}
                        </button>
                    </div>
                </div>

                {/* Translated Text Area */}
                <div className="space-y-2">
                    <label
                        htmlFor="translation"
                        className="text-gray-600 font-semibold text-lg">
                        Translation:
                    </label>
                    <textarea
                        id="translation"
                        className="w-full h-32 p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-50 resize-none"
                        readOnly
                        value={translatedText}
                        placeholder="Translation will appear here."
                    />
                </div>

                {voices.length > 0 && (
                    <div className="w-full">
                        <label className="block text-sm text-gray-600 mb-1">Voice</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={voiceName ?? ''}
                            onChange={(e) => setVoiceName(e.target.value || null)}>
                            {voices
                                .filter((v) => {
                                    return v.lang
                                        ?.toLowerCase()
                                        .startsWith(targetLanguage);
                                })
                                .map((v) => (
                                    <option key={v.name} value={v.name}>
                                        {v.name} — {v.lang}
                                        {v.default ? ' (default)' : ''}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Speak Translated Text Button */}
                <div className="w-full">
                    <button
                        onClick={speakTranslatedText}
                        className={`w-full px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 transform ${
                            !translatedText.trim() || isSpeaking
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        disabled={!translatedText.trim() || isSpeaking}>
                        {isSpeaking ? 'Speaking...' : 'Speak Translation'}
                    </button>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="text-red-500 bg-red-100 border border-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="my-4">Reference Docs</div>
                <ul className="list-disc list-inside">
                    <li>
                        <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API">
                            Web Speech
                        </Link>
                    </li>
                    <li>
                        <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Translator">
                            {`Translator (chrome only >= v138)`}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

const StyledArticle = styled.main`
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

const Kisko = () => {
    return (
        <StyledArticle>
            <SpeechApp />
        </StyledArticle>
    );
};

export default Kisko;
