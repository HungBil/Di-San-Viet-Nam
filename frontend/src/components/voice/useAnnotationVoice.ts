import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import {
  createAnnotationVoiceController,
  type AnnotationSpeechSynthesis,
  type AnnotationVoiceAudio,
  type AnnotationVoiceController,
  type AnnotationVoiceState,
  type AnnotationVoiceUtterance,
} from "./annotationVoiceController";

export function useAnnotationVoice(enabled: boolean) {
  const [voiceState, setVoiceState] = useState<AnnotationVoiceState>({
    phase: "idle",
  });
  const controllerRef = useRef<AnnotationVoiceController | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setVoiceState({ phase: "idle" });
      return;
    }

    const controller = createAnnotationVoiceController({
      createAudio: (url) => new Audio(url) as unknown as AnnotationVoiceAudio,
      createUtterance: (text) =>
        new SpeechSynthesisUtterance(text) as unknown as AnnotationVoiceUtterance,
      narrate: async (text) => {
        const result = await api.annotationNarration({ text });
        return result.text;
      },
      onStateChange: setVoiceState,
      speechSynthesis:
        "speechSynthesis" in window
          ? (window.speechSynthesis as unknown as AnnotationSpeechSynthesis)
          : null,
      tts: ({ provider, text }) => api.tts({ provider, text }),
    });

    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [enabled]);

  const speakAnnotation = useCallback(
    (text: string) => {
      if (!enabled) return Promise.resolve();
      return controllerRef.current?.speak(text) ?? Promise.resolve();
    },
    [enabled],
  );

  const stopAnnotationVoice = useCallback(() => {
    controllerRef.current?.stop();
  }, []);

  return { speakAnnotation, stopAnnotationVoice, voiceState };
}
