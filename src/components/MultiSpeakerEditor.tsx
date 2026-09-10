import { MultiSpeakerConfig, VoiceInfo } from "../types";
import { Users, Plus } from "lucide-react";
import { CORE_VOICES, EXTENDED_VOICES } from "../data/presets";

interface MultiSpeakerEditorProps {
  config: MultiSpeakerConfig;
  onChangeConfig: (next: MultiSpeakerConfig) => void;
  voices: VoiceInfo[];
  scriptText: string;
  onChangeScript: (text: string) => void;
  disabled?: boolean;
}

export default function MultiSpeakerEditor({
  config,
  onChangeConfig,
  scriptText,
  onChangeScript,
  disabled,
}: MultiSpeakerEditorProps) {
  const insertSpeakerTag = (speakerName: string) => {
    const trimmed = scriptText.trim();
    const addition = trimmed.length > 0 ? `\n${speakerName}: ` : `${speakerName}: `;
    onChangeScript(scriptText + addition);
  };

  const renderVoiceOptions = () => (
    <>
      <optgroup label="Core Voices (5 เสียงหลัก)">
        {CORE_VOICES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} ({v.gender} - {v.style.split(",")[0]})
          </option>
        ))}
      </optgroup>
      <optgroup label="Extended Voices (เสียงเพิ่มเติม)">
        {EXTENDED_VOICES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} ({v.gender} - {v.style.split(",")[0]})
          </option>
        ))}
      </optgroup>
    </>
  );

  return (
    <div id="multi-speaker-editor" className="space-y-4">
      {/* Speaker Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Speaker 1 */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Speaker 1
            </span>
            <button
              type="button"
              onClick={() => insertSpeakerTag(config.speaker1.name)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
              title="Insert speaker prompt line"
            >
              <Plus className="w-3 h-3" /> Add line
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Name / Role
              </label>
              <input
                type="text"
                id="speaker1-name-input"
                value={config.speaker1.name}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    speaker1: { ...config.speaker1, name: e.target.value },
                  })
                }
                disabled={disabled}
                placeholder="e.g. Joe"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Gemini Voice
              </label>
              <select
                id="speaker1-voice-select"
                value={config.speaker1.voice}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    speaker1: { ...config.speaker1, voice: e.target.value },
                  })
                }
                disabled={disabled}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {renderVoiceOptions()}
              </select>
            </div>
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Speaker 2
            </span>
            <button
              type="button"
              onClick={() => insertSpeakerTag(config.speaker2.name)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5 hover:underline cursor-pointer"
              title="Insert speaker prompt line"
            >
              <Plus className="w-3 h-3" /> Add line
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Name / Role
              </label>
              <input
                type="text"
                id="speaker2-name-input"
                value={config.speaker2.name}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    speaker2: { ...config.speaker2, name: e.target.value },
                  })
                }
                disabled={disabled}
                placeholder="e.g. Jane"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Gemini Voice
              </label>
              <select
                id="speaker2-voice-select"
                value={config.speaker2.voice}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    speaker2: { ...config.speaker2, voice: e.target.value },
                  })
                }
                disabled={disabled}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {renderVoiceOptions()}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Script Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dialogue Script
          </label>
          <span className="text-xs text-slate-400">
            Prefix each turn with <strong>{config.speaker1.name}:</strong> or <strong>{config.speaker2.name}:</strong>
          </span>
        </div>
        <textarea
          id="multi-speaker-dialogue-input"
          value={scriptText}
          onChange={(e) => onChangeScript(e.target.value)}
          disabled={disabled}
          rows={5}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 shadow-2xs"
          placeholder={`${config.speaker1.name}: Did you test the speech synthesis yet?\n${config.speaker2.name}: Yes, the voice quality is stunning!`}
        />
      </div>
    </div>
  );
}
