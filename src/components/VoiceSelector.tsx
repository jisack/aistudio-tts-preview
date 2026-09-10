import { useState, type FormEvent } from "react";
import { VoiceInfo } from "../types";
import { User, Volume2, Sparkles, ChevronRight, Edit3 } from "lucide-react";
import { CORE_VOICES, EXTENDED_VOICES } from "../data/presets";

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export default function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  disabled,
}: VoiceSelectorProps) {
  const [tab, setTab] = useState<"core" | "extended" | "custom">("core");
  const [customVoiceInput, setCustomVoiceInput] = useState("");

  const displayedVoices = tab === "core" ? CORE_VOICES : EXTENDED_VOICES;

  const handleApplyCustom = (e: FormEvent) => {
    e.preventDefault();
    if (customVoiceInput.trim()) {
      onSelectVoice(customVoiceInput.trim());
    }
  };

  return (
    <div id="voice-selector-container" className="space-y-3">
      {/* Category selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Gemini Voice Selection ({selectedVoice})
        </label>

        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setTab("core")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              tab === "core"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Core (5 เสียงหลัก)
          </button>
          <button
            type="button"
            onClick={() => setTab("extended")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              tab === "extended"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Extended (เสียงเพิ่มเติม)
          </button>
          <button
            type="button"
            onClick={() => setTab("custom")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
              tab === "custom"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Custom
          </button>
        </div>
      </div>

      {/* Core or Extended Grid */}
      {tab !== "custom" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {displayedVoices.map((v) => {
            const isSelected = selectedVoice.toLowerCase() === v.id.toLowerCase();
            return (
              <button
                key={v.id}
                type="button"
                id={`voice-option-${v.id.toLowerCase()}`}
                onClick={() => onSelectVoice(v.id)}
                disabled={disabled}
                className={`text-left p-3 rounded-xl border transition-all relative group flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5 w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {v.name[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-slate-900 leading-tight block">
                        {v.name}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {v.gender}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  <p className="text-xs text-slate-700 font-medium leading-snug">
                    {v.style}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    <strong className="font-medium text-slate-600">Ideal for:</strong> {v.bestFor}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Custom voice name input */
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">
                Custom Gemini Prebuilt Voice Name
              </p>
              <p>
                You can specify any supported Gemini voice name directly (e.g. <em>Achernar</em>, <em>Aoede</em>, <em>Autonoe</em>, <em>Callirrhoe</em>, <em>Enceladus</em>, <em>Iapetus</em>, <em>Umbriel</em>, <em>Schedar</em>).
              </p>
            </div>
          </div>

          <form onSubmit={handleApplyCustom} className="flex gap-2">
            <input
              type="text"
              id="custom-voice-name-input"
              value={customVoiceInput}
              onChange={(e) => setCustomVoiceInput(e.target.value)}
              placeholder="e.g. Aoede, Achernar, Callirrhoe"
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Set Voice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-[11px] text-slate-500">
            Currently active voice: <span className="font-bold text-blue-700">{selectedVoice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
