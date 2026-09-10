import { GeneratedClip } from "../types";
import { Play, Download, Trash2, History } from "lucide-react";

interface HistoryListProps {
  clips: GeneratedClip[];
  activeClipId: string | null;
  onSelectClip: (clip: GeneratedClip) => void;
  onClearHistory: () => void;
}

export default function HistoryList({
  clips,
  activeClipId,
  onSelectClip,
  onClearHistory,
}: HistoryListProps) {
  if (clips.length === 0) return null;

  return (
    <div id="session-history-container" className="space-y-3 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          Generation History ({clips.length})
        </h4>
        <button
          onClick={onClearHistory}
          className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {clips.map((c) => {
          const isActive = activeClipId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => onSelectClip(c)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isActive
                  ? "bg-blue-50/80 border-blue-400 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-900">
                      {c.voiceUsed}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                      {c.durationSeconds.toFixed(1)}s
                    </span>
                    {c.directive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium truncate max-w-[120px]">
                        {c.directive}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.text}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement("a");
                  a.href = `data:audio/wav;base64,${c.audioBase64}`;
                  a.download = `gemini-tts-${c.id}.wav`;
                  a.click();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                title="Download WAV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
