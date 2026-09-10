import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Check,
  Share2,
} from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";
import { GeneratedClip } from "../types";

interface AudioPlayerProps {
  clip: GeneratedClip | null;
}

export default function AudioPlayer({ clip }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  // Audio source URL
  const audioSrc = clip
    ? `data:audio/wav;base64,${clip.audioBase64}`
    : "";

  useEffect(() => {
    // When clip changes, reset states and auto-play
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.playbackRate = playbackRate;

      if (clip) {
        // Attempt autoplay on new generation
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked by browser until user interaction
          setIsPlaying(false);
        });
      }
    }
  }, [clip]);

  const togglePlay = () => {
    if (!audioRef.current || !clip) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(isNaN(dur) || !isFinite(dur) ? (clip?.durationSeconds || 0) : dur);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadWav = () => {
    if (!clip) return;
    const a = document.createElement("a");
    a.href = audioSrc;
    const filename = `gemini-tts-${clip.voiceUsed.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.wav`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyAudioData = async () => {
    if (!clip) return;
    try {
      await navigator.clipboard.writeText(clip.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  if (!clip) {
    return (
      <div id="audio-player-empty" className="p-8 border border-dashed border-slate-300 rounded-2xl text-center bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Play className="w-5 h-5 ml-0.5" />
        </div>
        <p className="text-sm font-medium text-slate-700 mb-1">
          No Audio Generated Yet
        </p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Choose a voice, write or select a sample phrase, and click <strong>Generate Speech</strong> to hear Gemini TTS in action.
        </p>
      </div>
    );
  }

  const effectiveDuration = duration > 0 ? duration : (clip.durationSeconds || 1);
  const progressPercent = Math.min(100, (currentTime / effectiveDuration) * 100);

  return (
    <div id="audio-player-card" className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {clip.mode === "multi" ? "Multi-Speaker" : "Voice: " + clip.voiceUsed}
          </span>
          {clip.directive && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-xs">
              Style: {clip.directive}
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">
            ~{effectiveDuration.toFixed(1)}s (24kHz WAV)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-text-btn"
            onClick={copyAudioData}
            title="Copy synthesized text"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? "Copied text" : "Copy text"}</span>
          </button>
          <button
            id="download-wav-btn"
            onClick={downloadWav}
            title="Download standard 24kHz WAV audio"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download WAV</span>
          </button>
        </div>
      </div>

      {/* Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} audioElement={audioRef.current} />

      {/* Timeline Scrub Bar */}
      <div className="space-y-1.5">
        <div className="relative flex items-center group">
          <input
            id="audio-progress-slider"
            type="range"
            min={0}
            max={effectiveDuration}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #2563eb ${progressPercent}%, #e2e8f0 ${progressPercent}%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* Playback Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          <button
            id="restart-audio-btn"
            onClick={restartAudio}
            title="Replay from start"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="play-pause-btn"
            onClick={togglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-transform active:scale-95"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Speed presets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 px-1 font-medium">Speed:</span>
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              id={`speed-btn-${rate}`}
              onClick={() => changeSpeed(rate)}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                playbackRate === rate
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            id="mute-btn"
            onClick={toggleMute}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-18 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
          />
        </div>
      </div>

      {/* Processed Text Snippet Preview */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-sans">
        <span className="font-semibold text-slate-800">Transcript: </span>
        <span className="italic">"{clip.text}"</span>
      </div>
    </div>
  );
}
