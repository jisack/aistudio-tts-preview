export interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
  style: string;
  bestFor: string;
}

export type TTSMode = "single" | "multi";

export interface MultiSpeakerConfig {
  speaker1: {
    name: string;
    voice: string;
  };
  speaker2: {
    name: string;
    voice: string;
  };
}

export interface GeneratedClip {
  id: string;
  timestamp: number;
  text: string;
  audioBase64: string;
  durationSeconds: number;
  mode: TTSMode;
  voiceUsed: string;
  directive?: string;
  multiSpeakers?: MultiSpeakerConfig;
}

export interface PresetSample {
  id: string;
  label: string;
  category: "greetings" | "story" | "meditation" | "news" | "dialogue" | "tech";
  mode: TTSMode;
  directive?: string;
  voice?: string;
  text: string;
  multiSpeakers?: MultiSpeakerConfig;
}
