import {
  BookOpen,
  Landmark,
  Loader2,
  MapPinned,
  MapPin,
  MessageCircle,
  Mic,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { FormEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ProvinceGeoJsonMap,
  type MapMarker,
} from "../components/map/ProvinceGeoJsonMap";
import { api } from "../lib/api";
import type { ChatMessage, GlbModel, StoryTargetType } from "../lib/types";

const EmbeddedModelViewer = lazy(() =>
  import("./ModelViewerPage").then((module) => ({
    default: module.ModelViewerPage,
  })),
);

const thangLongCitadel: MapMarker = {
  id: "thang-long-citadel",
  name: "Hoàng thành Thăng Long",
  image: "/images/hoang-thanh-thang-long.webp",
  latitude: 21.039444,
  longitude: 105.837222,
  address: "19C Hoàng Diệu, phường Điện Biên, quận Ba Đình, Hà Nội",
};

const hoaKhiemPalace: MapMarker = {
  id: "hoa-khiem-palace",
  name: "Điện Hòa Khiêm – Lăng Tự Đức",
  image: "/images/lang-vua-tu-duc.webp",
  latitude: 16.4328,
  longitude: 107.5658,
  address: "Đường Đoàn Nhữ Hải, Thủy Xuân, Thành phố Huế, Thừa Thiên Huế",
};

const mapMarkers = [thangLongCitadel, hoaKhiemPalace];

const sealModel = {
  name: "Ấn Sắc mệnh chi bảo",
  path: "Ấn_Sắc_mệnh_chi_bảo-compressed.glb",
  url: "/models/%E1%BA%A4n_S%E1%BA%AFc_m%E1%BB%87nh_chi_b%E1%BA%A3o-compressed.glb",
  size: 7848516,
};

const hoaKhiemModel = {
  name: "Lăng vua Tự Đức - khu Hòa Khiêm",
  path: "Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  url: "/models/Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  size: 20792420,
};

const markerModels: Record<string, GlbModel> = {
  [thangLongCitadel.id]: sealModel,
  [hoaKhiemPalace.id]: hoaKhiemModel,
};

type GuideTarget = {
  targetType: StoryTargetType;
  targetId: string;
  title: string;
  description: string;
  suggestions: string[];
};

const defaultGuideTarget: GuideTarget = {
  targetType: "landmark",
  targetId: "imperial-city-hue",
  title: "Di Sản Việt",
  description:
    "Hỏi về các di sản trên bản đồ, kiến trúc, lịch sử hoặc câu chuyện tham quan.",
  suggestions: [
    "Kể một câu chuyện ngắn về Lăng Tự Đức",
    "Điểm nổi bật nhất của Cố đô Huế là gì?",
  ],
};

const markerGuideTargets: Record<string, GuideTarget> = {
  [thangLongCitadel.id]: {
    targetType: "landmark",
    targetId: "thang-long-citadel",
    title: "Hướng dẫn viên Hoàng thành Thăng Long",
    description:
      "Đặt câu hỏi về trung tâm quyền lực Đại Việt và các lớp khảo cổ Thăng Long.",
    suggestions: [
      "Vì sao Hoàng thành Thăng Long quan trọng?",
      "Kể một câu chuyện dễ hiểu về Đoan Môn",
    ],
  },
  [hoaKhiemPalace.id]: {
    targetType: "landmark",
    targetId: "imperial-city-hue",
    title: "Hướng dẫn viên Lăng Tự Đức",
    description:
      "Đặt câu hỏi về khu Hòa Khiêm, Cố đô Huế và câu chuyện triều Nguyễn.",
    suggestions: [
      "Kể về Lăng Tự Đức như một hướng dẫn viên",
      "Khu Hòa Khiêm có gì đáng chú ý?",
    ],
  },
};

export function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const selectedModel = selectedMarker
    ? markerModels[selectedMarker.id]
    : undefined;
  const guideTarget = selectedMarker
    ? markerGuideTargets[selectedMarker.id]
    : defaultGuideTarget;

  function openAgentChat() {
    setIsAgentOpen(true);
  }

  return (
    <div className="heritage-surface -mt-[88px] min-h-screen pt-[40px]">
      <section className="mx-auto max-w-[1600px] px-3 pb-12 pt-8 sm:px-4 sm:pt-10 lg:px-5">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--heritage-line)] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-2 font-serif text-4xl text-[var(--heritage-brown)] sm:text-5xl">
              Khám phá Việt Nam
            </h1>
          </div>
          <button
            type="button"
            onClick={openAgentChat}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--heritage-brown)] px-4 py-3 text-sm font-semibold text-[var(--heritage-white)] shadow-[0_12px_28px_rgba(45,40,32,0.16)] transition hover:bg-[var(--heritage-bronze)] focus:outline-none focus:ring-2 focus:ring-[var(--heritage-bronze)] focus:ring-offset-2 focus:ring-offset-[var(--heritage-paper-light)] sm:self-end"
            aria-label="Nói chuyện với hướng dẫn viên AI"
          >
            <MessageCircle size={18} strokeWidth={1.8} />
            Nói chuyện với AI
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <ProvinceGeoJsonMap
              className="h-[620px] min-h-[620px] border border-[var(--heritage-line)] shadow-[0_20px_48px_rgba(45,40,32,0.14)]"
              markers={mapMarkers}
              activeMarkerId={selectedMarker?.id}
              onMarkerClick={setSelectedMarker}
            />
          </div>

          <div className="min-w-0 self-stretch">
            {selectedModel ? (
              <Suspense
                fallback={
                  <div className="h-full min-h-[620px] animate-pulse rounded-lg bg-[var(--heritage-paper-deep)]" />
                }
              >
                <EmbeddedModelViewer
                  key={selectedModel.path}
                  embeddedModel={selectedModel}
                />
              </Suspense>
            ) : (
              <div className="grid h-full min-h-[620px] place-items-center overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-deep)] p-8 text-center shadow-[0_20px_48px_rgba(45,40,32,0.14)]">
                <div className="max-w-sm">
                  <MapPinned
                    className="mx-auto text-[var(--heritage-bronze)]"
                    size={42}
                    strokeWidth={1.4}
                  />
                  <h2 className="mt-5 font-serif text-2xl text-[var(--heritage-brown)]">
                    Chọn một địa điểm trên bản đồ
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--heritage-muted)]">
                    Bấm vào một marker di sản để mở và tương tác với model 3D
                    tương ứng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isAgentOpen ? (
          <AgentGuidePanel
            target={guideTarget}
            onClose={() => setIsAgentOpen(false)}
          />
        ) : null}
      </section>
    </div>
  );
}

function AgentGuidePanel({
  target,
  onClose,
}: {
  target: GuideTarget;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState(target.suggestions);
  const [lastAnswer, setLastAnswer] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    stopAudio();
    setHistory([]);
    setSuggestions(target.suggestions);
    setLastAnswer("");
    setMessage("");
    setStatus(null);

    return stopAudio;
  }, [target.targetId, target.targetType]);

  async function send(nextMessage: string) {
    const trimmedMessage = nextMessage.trim();
    if (!trimmedMessage || isChatLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmedMessage };
    const nextHistory = [...history, userMessage];
    setHistory(nextHistory);
    setMessage("");
    setIsChatLoading(true);
    setStatus(null);

    try {
      const response = await api.chat({
        targetType: target.targetType,
        targetId: target.targetId,
        message: trimmedMessage,
        history,
      });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
      };
      setHistory([...nextHistory, assistantMessage]);
      setSuggestions(response.suggestions);
      setLastAnswer(response.answer);
      if (isSpeechEnabled) {
        void speak(response.answer);
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Không gọi được agent hướng dẫn viên.",
      );
    } finally {
      setIsChatLoading(false);
    }
  }

  async function startVoiceQuestion() {
    if (isRecording || isChatLoading) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Trình duyệt không hỗ trợ ghi âm.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        void submitVoiceQuestion();
      };

      recorder.start();
      setIsRecording(true);
      setStatus("Đang nghe... giữ nút và nói câu hỏi.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không mở được microphone.",
      );
    }
  }

  function stopVoiceQuestion() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setStatus("Đang chuyển giọng nói thành văn bản...");
  }

  async function submitVoiceQuestion() {
    const audioBlob = new Blob(recordedChunksRef.current, {
      type: "audio/webm",
    });
    recordedChunksRef.current = [];
    if (audioBlob.size === 0) {
      setStatus("Không thu được âm thanh.");
      return;
    }

    try {
      const file = new File([audioBlob], "guide-question.webm", {
        type: "audio/webm",
      });
      const result = await api.stt(file, "elevenlabs");
      const transcript = result.text.trim();
      if (!transcript) {
        setStatus("Không nhận diện được nội dung câu hỏi.");
        return;
      }
      setMessage(transcript);
      setStatus(`Bạn vừa nói: ${transcript}`);
      await send(transcript);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Không chuyển được giọng nói thành văn bản.",
      );
    }
  }

  async function speak(text: string) {
    if (!text.trim()) return;

    stopAudio();
    setIsAudioLoading(true);
    try {
      const result = await api.tts({ text, provider: "elevenlabs" });
      setStatus(result.message);

      if (!result.audioUrl) return;

      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        setStatus("Không phát được audio ElevenLabs trên trình duyệt.");
      };
      setIsSpeaking(true);
      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      setStatus(
        error instanceof Error
          ? error.message
          : "Không tạo được giọng đọc ElevenLabs.",
      );
    } finally {
      setIsAudioLoading(false);
    }
  }

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsSpeaking(false);
    setIsAudioLoading(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(message);
  }

  function toggleSpeech() {
    setIsSpeechEnabled((enabled) => {
      if (enabled) {
        stopAudio();
      }
      return !enabled;
    });
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 flex h-[min(720px,calc(100vh-32px))] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-[1.45rem] border border-[#e6d8bb] bg-[#fffdf8] shadow-[0_24px_70px_rgba(45,35,18,0.3)] sm:bottom-5 sm:right-5">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#5c4724,#806733_55%,#56401f)] px-4 pb-5 pt-4 text-[#fffaf0] sm:px-5">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/trong-dong.webp')] bg-[length:340px_340px] bg-center opacity-[0.08]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-xl bg-[#fff8e8] shadow-[0_12px_26px_rgba(20,15,8,0.16)] ring-1 ring-white/25">
                <img
                  className="h-full w-full object-cover"
                  src="/favicon.png"
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <h2 className="font-serif text-[1.65rem] font-semibold leading-none tracking-[-0.02em] text-white">
                    Di Sản Việt
                  </h2>
                  <p className="mt-2 truncate text-sm leading-5 text-[#f4ead4]/86">
                    Tinh hoa di sản Việt
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  disabled={isAudioLoading}
                  className={[
                    "grid h-8 w-8 flex-none place-items-center rounded-full border text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                    isSpeechEnabled
                      ? "border-[#f6d99b]/65 bg-[#f6d99b]/24 ring-2 ring-[#f6d99b]/35"
                      : "border-white/15 bg-white/8 hover:bg-white/14",
                  ].join(" ")}
                  aria-label={
                    isSpeechEnabled
                      ? "Tắt tự đọc câu trả lời"
                      : "Bật tự đọc câu trả lời"
                  }
                  aria-pressed={isSpeechEnabled}
                  title={
                    isSpeechEnabled
                      ? "Đang bật tự đọc câu trả lời"
                      : "Bật tự đọc câu trả lời"
                  }
                >
                  {isAudioLoading ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : isSpeechEnabled ? (
                    <Volume2 size={15} />
                  ) : (
                    <VolumeX size={15} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 grid h-11 w-11 flex-none place-items-center rounded-full bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition hover:bg-white/22"
            aria-label="Đóng hướng dẫn viên AI"
          >
            <X size={23} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fffdf8] px-4 py-4 [scrollbar-color:#8b8a82_transparent] sm:px-5">
        {history.length === 0 ? (
          <div className="relative overflow-hidden rounded-[1.2rem] border border-[#e6d8bb] bg-[#fffaf0] p-4 text-lg leading-7 text-[#2d2820] shadow-[0_14px_34px_rgba(80,61,28,0.07)]">
            <div
              className="pointer-events-none absolute inset-0 bg-center bg-no-repeat opacity-[0.055]"
              style={{
                backgroundImage: "url('/images/trong-dong.webp')",
                backgroundSize: "105%",
              }}
            />
            <p className="relative font-serif">
              Chào bạn, tôi là hướng dẫn viên Di Sản Việt. Hãy hỏi về một địa
              điểm, hiện vật hoặc giữ nút mic để trò chuyện bằng giọng nói.
            </p>
          </div>
        ) : (
          history.map((item, index) =>
            item.role === "user" ? (
              <div key={`${item.role}-${index}`} className="flex justify-end">
                <div className="max-w-[78%] rounded-[1.05rem] rounded-tr-md bg-[linear-gradient(135deg,#5d471f,#856730)] px-4 py-3 font-serif text-base leading-6 text-white shadow-[0_12px_26px_rgba(72,52,18,0.2)]">
                  {item.content}
                </div>
              </div>
            ) : (
              <div
                key={`${item.role}-${index}`}
                className="grid grid-cols-[2.75rem_1fr] items-end gap-2.5"
              >
                <span className="mb-1.5 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#f7edd5] shadow-[0_8px_18px_rgba(91,70,32,0.11)] ring-1 ring-[#e6d8bb]">
                  <img
                    className="h-full w-full object-cover"
                    src="/favicon.png"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
                <div className="relative overflow-hidden rounded-[1.2rem] border border-[#e3d5b7] bg-[#fffaf0] px-4 py-4 text-[#2d2820] shadow-[0_14px_34px_rgba(80,61,28,0.07)]">
                  <div
                    className="pointer-events-none absolute inset-0 bg-center bg-no-repeat opacity-[0.06]"
                    style={{
                      backgroundImage: "url('/images/trong-dong.webp')",
                      backgroundSize: "112%",
                    }}
                  />
                  <p className="relative font-serif text-lg leading-8 tracking-[-0.01em]">
                    {item.content}
                  </p>
                </div>
              </div>
            ),
          )
        )}

        {isChatLoading ? (
          <div className="grid grid-cols-[2.75rem_1fr] items-end gap-2.5">
            <span className="mb-1.5 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#f7edd5] shadow-[0_8px_18px_rgba(91,70,32,0.11)] ring-1 ring-[#e6d8bb]">
              <img
                className="h-full w-full object-cover"
                src="/favicon.png"
                alt=""
                aria-hidden="true"
              />
            </span>
            <div className="relative inline-flex w-fit items-center gap-1.5 overflow-hidden rounded-[1.2rem] border border-[#e3d5b7] bg-[#fffaf0] px-4 py-3 shadow-[0_14px_34px_rgba(80,61,28,0.07)]">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#8d6c2e] [animation-delay:-0.24s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#a98235] [animation-delay:-0.12s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#c19a4b]" />
            </div>
          </div>
        ) : null}

        <div className="rounded-[1.1rem] border border-[#e6d8bb] bg-[#fffaf0]/78 px-3 py-3 shadow-[0_10px_24px_rgba(80,61,28,0.055)]">
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-[#e2d4b8]" />
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3f3524]">
              <Sparkles size={17} className="text-[#b28a39]" />
              Bạn có thể hỏi thêm
            </span>
            <span className="h-px flex-1 bg-[#e2d4b8]" />
          </div>

          <div className="space-y-2">
            {suggestions.map((suggestion, index) => {
              const SuggestionIcon =
                index % 3 === 0
                  ? Landmark
                  : index % 3 === 1
                    ? MapPin
                    : BookOpen;
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[#eadfc8] bg-white/72 px-3 py-2.5 text-left font-serif text-base leading-6 text-[#3a3022] transition hover:border-[#b38d43] hover:bg-white"
                >
                  <SuggestionIcon
                    className="flex-none text-[#b38d43]"
                    size={20}
                    strokeWidth={1.8}
                  />
                  <span className="min-w-0 flex-1">{suggestion}</span>
                  <span className="text-xl leading-none text-[#856730] transition group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#eee4cf] bg-[#fffdf8] px-4 py-3.5 sm:px-5">
        {status ? (
          <p className="mb-2 truncate text-[11px] text-[#776f62]">{status}</p>
        ) : null}
        <form onSubmit={onSubmit} className="flex gap-2.5">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-w-0 flex-1 rounded-[0.95rem] border border-[#e1d3b9] bg-white px-4 py-3 font-serif text-base text-[#2d2820] shadow-[0_8px_20px_rgba(80,61,28,0.055)] outline-none transition placeholder:text-[#a59b8c] focus:border-[#9b7a3a]"
            placeholder="Hỏi thêm về Di Sản Việt..."
          />
          <button
            type="submit"
            disabled={isChatLoading}
            className="grid h-12 w-12 flex-none place-items-center rounded-[0.95rem] bg-[linear-gradient(135deg,#5d471f,#9b7a3a)] text-white shadow-[0_10px_22px_rgba(91,70,32,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Gửi câu hỏi"
          >
            {isChatLoading ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Send size={17} />
            )}
          </button>
          <button
            type="button"
            disabled={isChatLoading}
            onMouseDown={() => void startVoiceQuestion()}
            onMouseUp={stopVoiceQuestion}
            onMouseLeave={stopVoiceQuestion}
            onTouchStart={(event) => {
              event.preventDefault();
              void startVoiceQuestion();
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              stopVoiceQuestion();
            }}
            className={[
              "grid h-12 w-12 flex-none place-items-center rounded-[0.95rem] text-white shadow-[0_10px_22px_rgba(91,70,32,0.2)] transition disabled:cursor-not-allowed disabled:opacity-60",
              isRecording
                ? "bg-[#b94d35] shadow-[0_0_0_6px_rgba(185,77,53,0.18)]"
                : "bg-[linear-gradient(135deg,#7d5d22,#b58c38)] hover:brightness-110",
            ].join(" ")}
            aria-label="Giữ để hỏi bằng giọng nói"
            title="Giữ để nói, thả để gửi"
          >
            <Mic size={17} />
          </button>
        </form>
      </div>
    </aside>
  );
}
