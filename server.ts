import "dotenv/config";
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please ensure an API key is configured in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Converts raw 24kHz 16-bit mono PCM into standard RIFF WAV format
 * if the audio is not already in WAV container.
 */
function ensureWavFormat(
  base64Data: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): { wavBase64: string; durationSeconds: number } {
  const buffer = Buffer.from(base64Data, "base64");

  // If already a RIFF WAV file, return directly
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF") {
    const bytesPerSec = (sampleRate * numChannels * bitsPerSample) / 8;
    const duration = Math.max(0.1, buffer.length / bytesPerSec);
    return { wavBase64: base64Data, durationSeconds: Math.round(duration * 10) / 10 };
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = buffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const wavHeader = Buffer.alloc(headerSize);

  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(totalSize - 8, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size
  wavHeader.writeUInt16LE(1, 20); // PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  const fullWav = Buffer.concat([wavHeader, buffer]);
  const duration = Math.max(0.1, dataSize / byteRate);

  return {
    wavBase64: fullWav.toString("base64"),
    durationSeconds: Math.round(duration * 10) / 10,
  };
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.1-flash-tts-preview",
  });
});

// Available prebuilt voices with acoustic character descriptions
const AVAILABLE_VOICES = [
  // Core 5 official prebuilt voices
  {
    id: "Puck",
    name: "Puck",
    gender: "Male",
    style: "Friendly, dynamic & expressive",
    bestFor: "Casual conversation, storytelling, cheerful prompts",
    category: "core",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    style: "Deep, resonant & authoritative",
    bestFor: "Audiobooks, documentaries, serious narration",
    category: "core",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    style: "Warm, soothing & natural",
    bestFor: "Guided meditation, virtual assistant, friendly explanations",
    category: "core",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    style: "Crisp, energetic & confident",
    bestFor: "Commercials, tutorials, presentations",
    category: "core",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Female",
    style: "Calm, clear & articulate",
    bestFor: "News reporting, educational content, podcasts",
    category: "core",
  },
  // Extended voices
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Female",
    style: "Melodic, warm & lyrical",
    bestFor: "Poetry, gentle narration & storytelling",
    category: "extended",
  },
  {
    id: "Achernar",
    name: "Achernar",
    gender: "Male",
    style: "Calm, deep & thoughtful",
    bestFor: "Documentaries & steady narration",
    category: "extended",
  },
  {
    id: "Autonoe",
    name: "Autonoe",
    gender: "Female",
    style: "Bright, engaging & upbeat",
    bestFor: "Educational videos & welcoming guides",
    category: "extended",
  },
  {
    id: "Callirrhoe",
    name: "Callirrhoe",
    gender: "Female",
    style: "Expressive, rich & articulate",
    bestFor: "Dramatic monologues & audio drama",
    category: "extended",
  },
  {
    id: "Enceladus",
    name: "Enceladus",
    gender: "Male",
    style: "Crisp, confident & modern",
    bestFor: "Tech presentations & explainers",
    category: "extended",
  },
  {
    id: "Iapetus",
    name: "Iapetus",
    gender: "Male",
    style: "Steady, balanced & professional",
    bestFor: "Corporate audiobooks & training",
    category: "extended",
  },
  {
    id: "Umbriel",
    name: "Umbriel",
    gender: "Male",
    style: "Gentle, soft & soothing",
    bestFor: "Relaxation, bedtime reading & mindfulness",
    category: "extended",
  },
  {
    id: "Schedar",
    name: "Schedar",
    gender: "Female",
    style: "Polished, poised & authoritative",
    bestFor: "News reporting & broadcast narration",
    category: "extended",
  },
  {
    id: "Pulcherrima",
    name: "Pulcherrima",
    gender: "Female",
    style: "Elegant, smooth & gentle",
    bestFor: "Luxury branding & literary prose",
    category: "extended",
  },
  {
    id: "Rasalgethi",
    name: "Rasalgethi",
    gender: "Male",
    style: "Bold, resonant & commanding",
    bestFor: "Movie trailers & epic adventures",
    category: "extended",
  },
];

app.get("/api/voices", (req, res) => {
  res.json({ voices: AVAILABLE_VOICES });
});

// Text-to-Speech generation endpoint
app.post("/api/tts/generate", async (req, res) => {
  try {
    const {
      mode = "single",
      text,
      voice = "Kore",
      directive = "",
      multiSpeakers = {
        speaker1: { name: "Joe", voice: "Kore" },
        speaker2: { name: "Jane", voice: "Puck" },
      },
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Please provide text to synthesize." });
      return;
    }

    const ai = getGenAI();
    let promptContent = text.trim();

    // If a style directive is provided (e.g. "Say cheerfully: ") and not already prefixed
    if (mode === "single" && directive && directive.trim()) {
      const cleanDirective = directive.trim().replace(/:$/, "");
      promptContent = `${cleanDirective}: ${promptContent}`;
    }

    let response;

    if (mode === "multi") {
      const s1Name = multiSpeakers.speaker1?.name || "Joe";
      const s1Voice = multiSpeakers.speaker1?.voice || "Kore";
      const s2Name = multiSpeakers.speaker2?.name || "Jane";
      const s2Voice = multiSpeakers.speaker2?.voice || "Puck";

      const dialoguePrompt = `TTS the following conversation between ${s1Name} and ${s2Name}:\n${promptContent}`;

      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: dialoguePrompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: s1Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: s1Voice },
                  },
                },
                {
                  speaker: s2Name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: s2Voice },
                  },
                },
              ],
            },
          },
        },
      });
    } else {
      // Single speaker
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptContent }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });
    }

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (p) => p.inlineData && p.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      // Sometimes model returns refusal or text feedback
      const textPart = candidate?.content?.parts?.find((p) => p.text);
      const feedback = textPart?.text || "The TTS model did not return audio data.";
      res.status(500).json({ error: feedback });
      return;
    }

    const rawBase64 = audioPart.inlineData.data;
    const { wavBase64, durationSeconds } = ensureWavFormat(rawBase64, 24000);

    res.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      durationSeconds,
      voiceUsed:
        mode === "multi"
          ? `${multiSpeakers.speaker1?.name} (${multiSpeakers.speaker1?.voice}) & ${multiSpeakers.speaker2?.name} (${multiSpeakers.speaker2?.voice})`
          : voice,
      mode,
      processedPrompt: promptContent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("TTS Generation Error:", message);
    res.status(500).json({
      error: message || "Failed to synthesize speech using Gemini TTS.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Voice Tester server running on http://localhost:${PORT}`);
  });
}

startServer();
