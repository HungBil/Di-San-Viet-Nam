export type AnnotationVoicePhase = "idle" | "loading" | "speaking" | "error";

export type AnnotationVoiceState = {
  message?: string;
  phase: AnnotationVoicePhase;
};

export type AnnotationVoiceProvider = "elevenlabs" | "openai" | "mock";

export type AnnotationVoiceTtsResult = {
  audioUrl: string | null;
  message: string;
  provider: string;
};

export type AnnotationVoiceAudio = {
  onended: (() => void) | null;
  onerror: (() => void) | null;
  pause: () => void;
  play: () => Promise<void>;
};

export type AnnotationVoiceUtterance = {
  lang: string;
  onend: (() => void) | null;
  text: string;
};

export type AnnotationSpeechSynthesis = {
  cancel: () => void;
  speak: (utterance: AnnotationVoiceUtterance) => void;
};

export type AnnotationVoiceControllerOptions = {
  createAudio?: (url: string) => AnnotationVoiceAudio;
  createUtterance?: (text: string) => AnnotationVoiceUtterance;
  narrate?: (text: string) => Promise<string>;
  onStateChange?: (state: AnnotationVoiceState) => void;
  provider?: AnnotationVoiceProvider;
  speechSynthesis?: AnnotationSpeechSynthesis | null;
  tts: (payload: { provider: AnnotationVoiceProvider; text: string }) => Promise<AnnotationVoiceTtsResult>;
};

export type AnnotationVoiceController = {
  dispose: () => void;
  speak: (text: string) => Promise<void>;
  stop: () => void;
};

export function createAnnotationVoiceController({
  createAudio,
  createUtterance,
  narrate,
  onStateChange,
  provider = "elevenlabs",
  speechSynthesis,
  tts,
}: AnnotationVoiceControllerOptions): AnnotationVoiceController {
  let currentAudio: AnnotationVoiceAudio | null = null;
  let currentVersion = 0;

  const emit = (state: AnnotationVoiceState) => {
    onStateChange?.(state);
  };

  const stopCurrent = (emitIdle: boolean) => {
    currentVersion += 1;
    currentAudio?.pause();
    currentAudio = null;
    speechSynthesis?.cancel();
    if (emitIdle) emit({ phase: "idle" });
  };

  const speakWithBrowser = (text: string, version: number) => {
    if (!speechSynthesis || !createUtterance) {
      emit({ message: "Không thể phát giọng nói trên trình duyệt này.", phase: "error" });
      return;
    }

    speechSynthesis.cancel();
    const utterance = createUtterance(text);
    utterance.lang = "vi-VN";
    utterance.onend = () => {
      if (version === currentVersion) emit({ phase: "idle" });
    };
    emit({ phase: "speaking" });
    speechSynthesis.speak(utterance);
  };

  emit({ phase: "idle" });

  return {
    dispose() {
      stopCurrent(false);
    },
    async speak(text: string) {
      stopCurrent(false);
      const requestVersion = currentVersion;
      emit({ phase: "loading" });

      try {
        let spokenText = text;
        if (narrate) {
          const narration = await narrate(text);
          if (requestVersion !== currentVersion) return;
          spokenText = narration.trim() || text;
        }

        const result = await tts({ provider, text: spokenText });
        if (requestVersion !== currentVersion) return;

        if (result.audioUrl && createAudio) {
          const audio = createAudio(result.audioUrl);
          currentAudio = audio;
          audio.onended = () => {
            if (requestVersion !== currentVersion) return;
            currentAudio = null;
            emit({ phase: "idle" });
          };
          audio.onerror = () => {
            if (requestVersion !== currentVersion) return;
            currentAudio = null;
            emit({ message: "Không phát được audio thuyết minh.", phase: "error" });
          };
          emit({ phase: "speaking" });
          await audio.play();
          return;
        }
      } catch (error) {
        if (requestVersion !== currentVersion) return;
      }

      if (requestVersion === currentVersion) speakWithBrowser(text, requestVersion);
    },
    stop() {
      stopCurrent(true);
    },
  };
}
