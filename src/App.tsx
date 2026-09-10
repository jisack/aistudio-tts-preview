import { useState, useEffect, type KeyboardEvent } from "react";
import {
  Volume2,
  Sparkles,
  Users,
  Code,
  Loader2,
  AlertCircle,
  Wand2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import VoiceSelector from "./components/VoiceSelector";
import MultiSpeakerEditor from "./components/MultiSpeakerEditor";
import AudioPlayer from "./components/AudioPlayer";
import HistoryList from "./components/HistoryList";
import CodeExportModal from "./components/CodeExportModal";
import {
  VOICES,
  STYLE_DIRECTIVES,
  PRESET_SAMPLES,
} from "./data/presets";
import {
  GeneratedClip,
  MultiSpeakerConfig,
  PresetSample,
  TTSMode,
} from "./types";

export default function App() {
  const [mode, setMode] = useState<TTSMode>("single");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [directive, setDirective] = useState("");
  const [customDirective, setCustomDirective] = useState("");
  const [singleText, setSingleText] = useState(
    "Hello! Welcome to the Gemini Text-to-Speech test lab. Select a voice and listen to how natural I sound."
  );

  const [multiSpeakers, setMultiSpeakers] = useState<MultiSpeakerConfig>({
    speaker1: { name: "Joe", voice: "Puck" },
    speaker2: { name: "Jane", voice: "Kore" },
  });
  const [multiScript, setMultiScript] = useState(
    `Joe: Hey Jane, did you test the new Gemini TTS model yet?
Jane: Yes! The natural inflection and multi-speaker separation are impressive.
Joe: And it generates 24kHz high fidelity audio right out of the box.`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<GeneratedClip | null>(null);
  const [history, setHistory] = useState<GeneratedClip[]>([]);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check health and server status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.error("Health check error:", err);
      });
  }, []);

  const activeDirective = customDirective.trim() || directive;
  const currentText = mode === "single" ? singleText : multiScript;

  const handleApplyPreset = (sample: PresetSample) => {
    setMode(sample.mode);
    if (sample.mode === "single") {
      setSingleText(sample.text);
      if (sample.voice) setSelectedVoice(sample.voice);
      if (sample.directive !== undefined) {
        setDirective(sample.directive);
        setCustomDirective("");
      }
    } else {
      setMultiScript(sample.text);
      if (sample.multiSpeakers) {
        setMultiSpeakers(sample.multiSpeakers);
      }
    }
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!currentText.trim()) {
      setErrorMessage("Please enter some text or dialogue to synthesize.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        mode,
        text: currentText.trim(),
        voice: selectedVoice,
        directive: activeDirective,
        multiSpeakers,
      };

      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Speech synthesis failed.");
      }

      const newClip: GeneratedClip = {
        id: `clip-${Date.now()}`,
        timestamp: Date.now(),
        text: currentText.trim(),
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds || 3,
        mode,
        voiceUsed: data.voiceUsed,
        directive: activeDirective,
        multiSpeakers: mode === "multi" ? multiSpeakers : undefined,
      };

      setActiveClip(newClip);
      setHistory((prev) => [newClip, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to synthesize
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading) handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  Gemini TTS Voice Tester
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Evaluate single-speaker voice profiles, expressiveness & multi-speaker conversations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {hasApiKey === false && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Configure key in Settings &gt; Secrets</span>
              </div>
            )}
            <button
              id="view-code-btn"
              type="button"
              onClick={() => setIsCodeModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>View API Code</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Presets Bar */}
        <section aria-label="Preset samples" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Test Presets
            </span>
            <span className="text-xs text-slate-400">Click any preset to test immediately</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                id={`preset-${sample.id}`}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-all flex items-center gap-2 hover:border-slate-300 shadow-2xs cursor-pointer"
              >
                {sample.mode === "multi" ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
                <span>{sample.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {sample.mode === "multi" ? "Dialogue" : sample.voice}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 2-Column Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input & Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Mode Switcher */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 max-w-md">
              <button
                id="mode-single-btn"
                type="button"
                onClick={() => setMode("single")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === "single"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                Single Speaker
              </button>
              <button
                id="mode-multi-btn"
                type="button"
                onClick={() => setMode("multi")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === "multi"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Multi-Speaker Dialogue
              </button>
            </div>

            {/* Mode: Single Speaker */}
            {mode === "single" && (
              <div className="space-y-4">
                {/* Voice Selection */}
                <VoiceSelector
                  voices={VOICES}
                  selectedVoice={selectedVoice}
                  onSelectVoice={(v) => setSelectedVoice(v)}
                  disabled={isLoading}
                />

                {/* Speech Style Directive (Prompt Directing) */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                      Speech Style & Emotional Directing
                    </label>
                    <span className="text-[11px] text-slate-400">Optional styling</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {STYLE_DIRECTIVES.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setDirective(item.value);
                          setCustomDirective("");
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                          directive === item.value && !customDirective
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <input
                      type="text"
                      id="custom-directive-input"
                      value={customDirective}
                      onChange={(e) => setCustomDirective(e.target.value)}
                      placeholder="Or type custom directive (e.g. 'Whisper excitedly as if discovering gold')"
                      className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Text Input Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="single-speech-input"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Text to Synthesize
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {singleText.length} characters
                      </span>
                      {singleText.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSingleText("")}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    id="single-speech-input"
                    value={singleText}
                    onChange={(e) => setSingleText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={5}
                    placeholder="Enter any text here to test pronunciation, pacing, and tone..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Mode: Multi-Speaker */}
            {mode === "multi" && (
              <div onKeyDown={handleKeyDown}>
                <MultiSpeakerEditor
                  config={multiSpeakers}
                  onChangeConfig={setMultiSpeakers}
                  voices={VOICES}
                  scriptText={multiScript}
                  onChangeScript={setMultiScript}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div
                id="tts-error-banner"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Synthesis Error</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex items-center gap-3">
              <button
                id="generate-tts-btn"
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !currentText.trim()}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                  isLoading || !currentText.trim()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Voice Audio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mode === "single") {
                    setSingleText(PRESET_SAMPLES[0].text);
                    setSelectedVoice("Kore");
                    setDirective("");
                    setCustomDirective("");
                  } else {
                    setMultiScript(PRESET_SAMPLES[4].text);
                  }
                }}
                className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Reset to default text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[10px] font-mono">⌘/Ctrl + Enter</kbd> to generate instantly
            </p>
          </div>

          {/* Right Column: Audio Playback, Inspection & History (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Audio Output & Controls
              </h3>
              <AudioPlayer clip={activeClip} />
            </div>

            {/* Quick Testing Tips Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                How to Test Different Aspects of TTS
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Voice Timbre:</strong> Switch between <em>Puck</em>, <em>Charon</em>, <em>Kore</em>, <em>Fenrir</em>, and <em>Zephyr</em> on the same sentence to hear distinct resonances.
                </li>
                <li>
                  <strong>Emotional Directing:</strong> Add style prefixes like <em>"Whisper mysteriously:"</em> or <em>"Say cheerfully:"</em> to test Gemini's emotional acoustic range.
                </li>
                <li>
                  <strong>Pacing & Pauses:</strong> Use ellipses (...), question marks, and commas to evaluate natural conversational pauses.
                </li>
                <li>
                  <strong>Multi-Speaker Flow:</strong> Switch to Dialogue mode to test 2 speakers conversing naturally in a single audio track.
                </li>
              </ul>
            </div>

            {/* Generation History */}
            <HistoryList
              clips={history}
              activeClipId={activeClip?.id || null}
              onSelectClip={(clip) => setActiveClip(clip)}
              onClearHistory={() => {
                setHistory([]);
                setActiveClip(null);
              }}
            />
          </div>
        </div>
      </main>

      {/* Code Export Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        mode={mode}
        voice={selectedVoice}
        directive={activeDirective}
        text={currentText}
        multiSpeakers={multiSpeakers}
      />
    </div>
  );
}
