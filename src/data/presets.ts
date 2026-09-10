import { PresetSample, VoiceInfo } from "../types";

// Core 5 official prebuilt voices highlighted in Google GenAI SDK
export const CORE_VOICES: VoiceInfo[] = [
  {
    id: "Puck",
    name: "Puck",
    gender: "Male",
    style: "Friendly, dynamic & expressive",
    bestFor: "Casual chats, storytelling & lively prompts",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    style: "Deep, resonant & authoritative",
    bestFor: "Documentaries, serious narration & deep audiobooks",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    style: "Warm, soothing & natural",
    bestFor: "Virtual assistants, meditation & gentle guides",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    style: "Crisp, energetic & confident",
    bestFor: "Product announcements, tutorials & podcasts",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Female",
    style: "Calm, clear & articulate",
    bestFor: "News broadcasts, educational lectures & summaries",
  },
];

// Extended voices supported in Gemini 3.1 Flash TTS
export const EXTENDED_VOICES: VoiceInfo[] = [
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Female",
    style: "Melodic, warm & lyrical",
    bestFor: "Poetry, gentle narration & storytelling",
  },
  {
    id: "Achernar",
    name: "Achernar",
    gender: "Male",
    style: "Calm, deep & thoughtful",
    bestFor: "Documentaries & steady narration",
  },
  {
    id: "Autonoe",
    name: "Autonoe",
    gender: "Female",
    style: "Bright, engaging & upbeat",
    bestFor: "Educational videos & welcoming guides",
  },
  {
    id: "Callirrhoe",
    name: "Callirrhoe",
    gender: "Female",
    style: "Expressive, rich & articulate",
    bestFor: "Dramatic monologues & audio drama",
  },
  {
    id: "Enceladus",
    name: "Enceladus",
    gender: "Male",
    style: "Crisp, confident & modern",
    bestFor: "Tech presentations & explainers",
  },
  {
    id: "Iapetus",
    name: "Iapetus",
    gender: "Male",
    style: "Steady, balanced & professional",
    bestFor: "Corporate audiobooks & training",
  },
  {
    id: "Umbriel",
    name: "Umbriel",
    gender: "Male",
    style: "Gentle, soft & soothing",
    bestFor: "Relaxation, bedtime reading & mindfulness",
  },
  {
    id: "Schedar",
    name: "Schedar",
    gender: "Female",
    style: "Polished, poised & authoritative",
    bestFor: "News reporting & broadcast narration",
  },
  {
    id: "Pulcherrima",
    name: "Pulcherrima",
    gender: "Female",
    style: "Elegant, smooth & gentle",
    bestFor: "Luxury branding & literary prose",
  },
  {
    id: "Rasalgethi",
    name: "Rasalgethi",
    gender: "Male",
    style: "Bold, resonant & commanding",
    bestFor: "Movie trailers & epic adventures",
  },
];

export const ALL_VOICES: VoiceInfo[] = [...CORE_VOICES, ...EXTENDED_VOICES];

// Backwards-compatible VOICES export
export const VOICES: VoiceInfo[] = ALL_VOICES;

export const STYLE_DIRECTIVES = [
  { label: "Natural (ธรรมชาติ)", value: "" },
  { label: "Cheerful (ร่าเริงแจ่มใส)", value: "Say cheerfully and warmly" },
  { label: "Whisper (กระซิบแผ่วเบา)", value: "Whisper mysteriously and softly" },
  { label: "Excited (ตื่นเต้นมีพลัง)", value: "Speak with high energy and excitement" },
  { label: "News Broadcaster (ผู้ประกาศข่าว)", value: "Read solemnly and clearly like a professional news anchor" },
  { label: "Soothing Bedtime (นุ่มนวลก่อนนอน)", value: "Speak in a gentle, calming, relaxed bedtime cadence" },
  { label: "Elderly Storyteller (คนแก่เล่านิทาน)", value: "Speak in the warm, weathered voice of an elderly wise storyteller" },
  { label: "Thai Friendly (ไทยสุภาพเป็นกันเอง)", value: "พูดด้วยน้ำเสียงสดใส เป็นมิตร อบอุ่น และชัดเจน" },
];

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "thai-welcome",
    label: "🇹🇭 ภาษาไทย - ต้อนรับอบอุ่น",
    category: "greetings",
    mode: "single",
    voice: "Kore",
    directive: "พูดด้วยน้ำเสียงสดใส เป็นมิตร อบอุ่น และชัดเจน",
    text: "สวัสดีครับ ยินดีต้อนรับสู่ระบบทดสอบเสียงสังเคราะห์ Gemini Text-to-Speech วันนี้เรามาลองฟังความลื่นไหลและน้ำเสียงที่เป็นธรรมชาติกันได้เลยครับ",
  },
  {
    id: "thai-dialogue",
    label: "🇹🇭 ภาษาไทย - บทสนทนา 2 คน",
    category: "dialogue",
    mode: "multi",
    text: `สมชาย: สวัสดีครับคุณแอน วันนี้ได้ลองระบบสังเคราะห์เสียงใหม่ของ Gemini หรือยังครับ?
แอน: สวัสดีค่ะคุณสมชาย ลองแล้วค่ะ เสียงพูดภาษาไทยชัดเจนมาก มีจังหวะวรรคตอนที่สมจริงเหมือนคนพูดเลยนะคะ!
สมชาย: ใช่เลยครับ แถมยังสร้างบทสนทนาสองคนพร้อมกันในไฟล์เดียวได้แบบนี้ด้วย สุดยอดจริงๆ ครับ`,
    multiSpeakers: {
      speaker1: { name: "สมชาย", voice: "Puck" },
      speaker2: { name: "แอน", voice: "Kore" },
    },
  },
  {
    id: "greeting-puck",
    label: "Cheerful Welcome (Puck)",
    category: "greetings",
    mode: "single",
    voice: "Puck",
    directive: "Say cheerfully and warmly",
    text: "Welcome to the Gemini Voice Studio! Today we are exploring natural speech synthesis, expressive styles, and multi-speaker dialogue.",
  },
  {
    id: "meditation-kore",
    label: "Mindful Breath (Kore)",
    category: "meditation",
    mode: "single",
    voice: "Kore",
    directive: "Speak in a gentle, calming, relaxed bedtime cadence",
    text: "Gently close your eyes. Take a slow, deep breath in through your nose, hold it for three seconds, and let it out with a soft sigh. Feel your shoulders drop and your mind settle.",
  },
  {
    id: "aoede-lyric",
    label: "Poetic Tone (Aoede)",
    category: "story",
    mode: "single",
    voice: "Aoede",
    directive: "Speak melodically like a thoughtful poet",
    text: "The river carries whispers of ancient stars, winding quietly beneath the silver canopy of night.",
  },
  {
    id: "story-charon",
    label: "Mythic Narration (Charon)",
    category: "story",
    mode: "single",
    voice: "Charon",
    directive: "Deliver dramatically with cinematic suspense",
    text: "Beyond the mist of the northern ridges lay the obsidian gate, untouched by human hand for three thousand years. The silence was broken only by the steady drum of thunder.",
  },
  {
    id: "dialogue-space",
    label: "Astronaut Dialogue",
    category: "dialogue",
    mode: "multi",
    text: `Commander Sarah: Mission control, orbit insertion is complete. How do the telemetry readings look on your end?
Flight Director Alex: Looking rock solid Sarah. All systems are green and you are clear for primary solar array deployment.
Commander Sarah: Copy that Houston. Commencing array release sequence in three, two, one.`,
    multiSpeakers: {
      speaker1: { name: "Commander Sarah", voice: "Zephyr" },
      speaker2: { name: "Flight Director Alex", voice: "Fenrir" },
    },
  },
];
