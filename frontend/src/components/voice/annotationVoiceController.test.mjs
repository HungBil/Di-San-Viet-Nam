import test from "node:test";
import assert from "node:assert/strict";
import { createAnnotationVoiceController } from "../../../.test-build/components/voice/annotationVoiceController.js";

test("plays TTS audio for annotation text", async () => {
  const states = [];
  const audio = createFakeAudio();
  const ttsCalls = [];

  const controller = createAnnotationVoiceController({
    createAudio: (url) => {
      assert.equal(url, "/voice/a.mp3");
      return audio;
    },
    onStateChange: (state) => states.push(state.phase),
    tts: async (payload) => {
      ttsCalls.push(payload);
      return { audioUrl: "/voice/a.mp3", message: "ok", provider: "mock" };
    },
  });

  await controller.speak("Diem 1. Noi dung chu thich.");

  assert.deepEqual(ttsCalls, [
    { text: "Diem 1. Noi dung chu thich.", provider: "elevenlabs" },
  ]);
  assert.equal(audio.playCount, 1);
  assert.deepEqual(states, ["idle", "loading", "speaking"]);
});

test("stops existing audio before starting the next annotation", async () => {
  const firstAudio = createFakeAudio();
  const secondAudio = createFakeAudio();
  const audios = [firstAudio, secondAudio];

  const controller = createAnnotationVoiceController({
    createAudio: () => audios.shift(),
    onStateChange: () => undefined,
    tts: async () => ({ audioUrl: "/voice/item.mp3", message: "ok", provider: "mock" }),
  });

  await controller.speak("Noi dung dau.");
  await controller.speak("Noi dung thu hai.");

  assert.equal(firstAudio.pauseCount, 1);
  assert.equal(secondAudio.playCount, 1);
});

test("falls back to browser speech when TTS fails", async () => {
  const spoken = [];
  const cancelled = [];

  const controller = createAnnotationVoiceController({
    createUtterance: (text) => ({ text, lang: "", onend: null }),
    onStateChange: () => undefined,
    speechSynthesis: {
      cancel: () => cancelled.push(true),
      speak: (utterance) => spoken.push(utterance),
    },
    tts: async () => {
      throw new Error("provider down");
    },
  });

  await controller.speak("Noi dung fallback.");

  assert.equal(cancelled.length, 2);
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, "Noi dung fallback.");
  assert.equal(spoken[0].lang, "vi-VN");
});

test("generates concise narration before sending text to TTS", async () => {
  const ttsCalls = [];
  const narrateCalls = [];
  const audio = createFakeAudio();

  const controller = createAnnotationVoiceController({
    createAudio: () => audio,
    narrate: async (text) => {
      narrateCalls.push(text);
      return "Day la phan gioi thieu ngan gon do agent viet.";
    },
    onStateChange: () => undefined,
    tts: async (payload) => {
      ttsCalls.push(payload);
      return { audioUrl: "/voice/narration.mp3", message: "ok", provider: "mock" };
    },
  });

  await controller.speak("Mat an. Hinh vuong, duc noi 4 chu Han.");

  assert.deepEqual(narrateCalls, ["Mat an. Hinh vuong, duc noi 4 chu Han."]);
  assert.deepEqual(ttsCalls, [
    {
      text: "Day la phan gioi thieu ngan gon do agent viet.",
      provider: "elevenlabs",
    },
  ]);
  assert.equal(audio.playCount, 1);
});

function createFakeAudio() {
  return {
    onended: null,
    onerror: null,
    pauseCount: 0,
    playCount: 0,
    pause() {
      this.pauseCount += 1;
    },
    async play() {
      this.playCount += 1;
    },
  };
}
