import { useState } from "react";
import { X, Copy, Check, Terminal } from "lucide-react";
import { MultiSpeakerConfig, TTSMode } from "../types";

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TTSMode;
  voice: string;
  directive: string;
  text: string;
  multiSpeakers: MultiSpeakerConfig;
}

export default function CodeExportModal({
  isOpen,
  onClose,
  mode,
  voice,
  directive,
  text,
  multiSpeakers,
}: CodeExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptText =
    mode === "single"
      ? directive
        ? `${directive}: ${text}`
        : text
      : `TTS the following conversation between ${multiSpeakers.speaker1.name} and ${multiSpeakers.speaker2.name}:\n${text}`;

  const codeSnippet =
    mode === "single"
      ? `// Server-side Gemini Text-to-Speech implementation
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function generateSingleSpeech() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: ${JSON.stringify(promptText)} }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "${voice}" },
        },
      },
    },
  });

  // Base64-encoded 24kHz 16-bit audio
  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  return base64Audio;
}`
      : `// Server-side Gemini Multi-Speaker Text-to-Speech implementation
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function generateDialogueSpeech() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: ${JSON.stringify(promptText)} }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: "${multiSpeakers.speaker1.name}",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "${multiSpeakers.speaker1.voice}" }
              }
            },
            {
              speaker: "${multiSpeakers.speaker2.name}",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "${multiSpeakers.speaker2.voice}" }
              }
            }
          ]
        }
      }
    }
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  return base64Audio;
}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="code-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Gemini TTS API Code Snippet
              </h3>
              <p className="text-xs text-slate-500">
                Using modern <code className="text-blue-600">@google/genai</code> SDK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="text-xs text-slate-600 leading-relaxed">
            This is the server-side code powering your current configuration. You can use this exact snippet in your Node.js or Express backend:
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{codeSnippet}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
            <strong className="block font-semibold">Key Specs:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800">
              <li>Model: <code className="bg-blue-100 px-1 py-0.2 rounded font-mono">gemini-3.1-flash-tts-preview</code></li>
              <li>Modality: <code className="bg-blue-100 px-1 py-0.2 rounded font-mono">responseModalities: [Modality.AUDIO]</code></li>
              <li>Output Audio: 24,000 Hz, 16-bit linear PCM (wrapped into RIFF WAV for browsers)</li>
              <li>Supports both single-speaker and multi-speaker (2 speakers) configurations</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
