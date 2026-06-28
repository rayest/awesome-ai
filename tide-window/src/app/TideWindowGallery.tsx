"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import styles from "./tide-window.module.css";

type MediaKind = "photo" | "video";
type Mode = "mixed" | "still" | "motion";

type TideWork = {
  id: string;
  kind: MediaKind;
  src: string;
  poster?: string;
  place?: string;
  capturedAt?: string;
};

type PexelsPhoto = {
  id: number;
  alt?: string;
  src: {
    landscape?: string;
    large2x?: string;
    large?: string;
    original?: string;
  };
};

type PexelsVideoFile = {
  link: string;
  quality?: string;
  width?: number;
  height?: number;
};

type PexelsVideo = {
  id: number;
  image?: string;
  video_files: PexelsVideoFile[];
};

type UnsplashPhoto = {
  id: string;
  created_at?: string;
  updated_at?: string;
  alt_description?: string;
  description?: string;
  urls: {
    regular: string;
    full?: string;
  };
  location?: {
    title?: string;
    name?: string;
  };
};

type AmbientAudio = {
  start: () => Promise<void>;
  stop: () => void;
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const CACHE_KEY = "tide-window-gallery-v2";
const CACHE_TTL = 1000 * 60 * 60 * 3;
const AUTO_ADVANCE_MS = 11000;

const FALLBACK_WORKS: TideWork[] = [
  {
    id: "fallback-atlantic",
    kind: "photo",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=86",
    place: "Atlantic",
  },
  {
    id: "fallback-pacific",
    kind: "photo",
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=86",
    place: "Pacific",
  },
  {
    id: "fallback-madeira",
    kind: "photo",
    src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2400&q=86",
    place: "Madeira",
  },
  {
    id: "fallback-cove",
    kind: "photo",
    src: "https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=2400&q=86",
    place: "Cove",
  },
];

const QUERIES = ["ocean", "sea", "coast", "waves", "quiet beach"];
const MEDIA_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseQuery() {
  return QUERIES[Math.floor(Math.random() * QUERIES.length)];
}

function pickVideoFile(files: PexelsVideoFile[]) {
  const landscapeFiles = files.filter((file) => {
    if (!file.width || !file.height) return true;
    return file.width >= file.height;
  });

  return (
    landscapeFiles.find((file) => file.quality === "hd") ??
    landscapeFiles[0] ??
    files[0]
  );
}

function extractPlace(text?: string) {
  if (!text) return undefined;

  const clean = text
    .replace(/\b(photo|image|video|view|landscape|seascape)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return undefined;

  const parts = clean.split(/,| at | in | near | from /i);
  const candidate = parts[parts.length - 1]?.trim() || clean;
  const words = candidate.split(" ").slice(0, 3).join(" ");

  return words.length > 2 ? words : undefined;
}

function formatMediaDate(value?: string) {
  if (!value) return "Recent";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return MEDIA_DATE_FORMATTER.format(date);
}

async function fetchPexelsPhotos(apiKey: string): Promise<TideWork[]> {
  const query = chooseQuery();
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query,
    )}&per_page=18&orientation=landscape`,
    {
      headers: { Authorization: apiKey },
    },
  );

  if (!response.ok) throw new Error("Pexels photo request failed");

  const payload = (await response.json()) as { photos?: PexelsPhoto[] };
  const works: TideWork[] = [];

  for (const photo of payload.photos ?? []) {
    const src =
      photo.src.large2x ??
      photo.src.landscape ??
      photo.src.large ??
      photo.src.original;

    if (!src) continue;

    works.push({
      id: `pexels-photo-${photo.id}`,
      kind: "photo",
      src,
      place: extractPlace(photo.alt),
    });
  }

  return works;
}

async function fetchPexelsVideos(apiKey: string): Promise<TideWork[]> {
  const query = chooseQuery();
  const response = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query,
    )}&per_page=12&orientation=landscape`,
    {
      headers: { Authorization: apiKey },
    },
  );

  if (!response.ok) throw new Error("Pexels video request failed");

  const payload = (await response.json()) as { videos?: PexelsVideo[] };
  const works: TideWork[] = [];

  for (const video of payload.videos ?? []) {
    const file = pickVideoFile(video.video_files);
    if (!file) continue;

    works.push({
      id: `pexels-video-${video.id}`,
      kind: "video",
      src: file.link,
      poster: video.image,
    });
  }

  return works;
}

async function fetchUnsplashPhotos(apiKey: string): Promise<TideWork[]> {
  const query = chooseQuery();
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query,
    )}&per_page=24&orientation=landscape&content_filter=high&order_by=latest`,
    {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
      },
    },
  );

  if (!response.ok) throw new Error("Unsplash request failed");

  const payload = (await response.json()) as { results?: UnsplashPhoto[] };

  return (payload.results ?? [])
    .map((photo) => ({
      id: `unsplash-${photo.id}`,
      kind: "photo" as const,
      src: photo.urls.regular ?? photo.urls.full,
      place:
        photo.location?.title ??
        photo.location?.name ??
        extractPlace(photo.alt_description ?? photo.description),
      capturedAt: photo.created_at ?? photo.updated_at,
    }))
    .sort((first, second) => {
      const firstTime = first.capturedAt ? new Date(first.capturedAt).getTime() : 0;
      const secondTime = second.capturedAt
        ? new Date(second.capturedAt).getTime()
        : 0;

      return secondTime - firstTime;
    });
}

async function fetchWorks() {
  const pexelsKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  const requests: Promise<TideWork[]>[] = [];

  if (pexelsKey) {
    requests.push(fetchPexelsPhotos(pexelsKey));
    requests.push(fetchPexelsVideos(pexelsKey));
  }

  if (unsplashKey) {
    requests.push(fetchUnsplashPhotos(unsplashKey));
  }

  if (requests.length === 0) return FALLBACK_WORKS;

  const results = await Promise.allSettled(requests);
  const works = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return works.length > 0 ? works : FALLBACK_WORKS;
}

function readCache() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { createdAt: number; works: TideWork[] };
    if (Date.now() - parsed.createdAt > CACHE_TTL) return null;
    if (!Array.isArray(parsed.works) || parsed.works.length === 0) return null;

    return parsed.works;
  } catch {
    return null;
  }
}

function writeCache(works: TideWork[]) {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ createdAt: Date.now(), works }),
    );
  } catch {
    // Browsers may deny storage in private mode; the gallery can stay ephemeral.
  }
}

function createNoiseSource(context: AudioContext, seconds = 3) {
  const buffer = context.createBuffer(
    1,
    context.sampleRate * seconds,
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[index] = last * 3.5;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  return source;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function createAmbientWaveUrl() {
  const sampleRate = 22050;
  const seconds = 28;
  const samples = sampleRate * seconds;
  const bytesPerSample = 2;
  const dataSize = samples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const gullStarts = [6.2, 15.4, 23.6];
  let lowNoise = 0;

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const white = Math.random() * 2 - 1;
    lowNoise = lowNoise * 0.985 + white * 0.015;
    const swell =
      0.48 +
      0.22 * Math.sin(Math.PI * 2 * 0.075 * time) +
      0.12 * Math.sin(Math.PI * 2 * 0.031 * time + 1.4);
    const foam = (Math.random() * 2 - 1) * 0.025 * Math.max(swell, 0.12);
    let sample = lowNoise * 1.85 * swell + foam;

    for (const start of gullStarts) {
      const age = time - start;
      if (age >= 0 && age < 1.05) {
        const envelope = Math.sin(Math.PI * age / 1.05);
        const pitch = 680 + 520 * Math.sin(Math.PI * age * 1.35);
        sample += Math.sin(Math.PI * 2 * pitch * time) * envelope * 0.028;
      }
    }

    const clamped = Math.max(-1, Math.min(1, sample * 0.62));
    view.setInt16(44 + index * bytesPerSample, clamped * 32767, true);
  }

  const blob = new Blob([view], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

function createElementAmbience(): AmbientAudio {
  const url = createAmbientWaveUrl();
  const audio = new Audio(url);
  let fadeTimer: number | undefined;

  audio.loop = true;
  audio.volume = 0;

  function fadeTo(volume: number, done?: () => void) {
    if (fadeTimer) window.clearInterval(fadeTimer);

    fadeTimer = window.setInterval(() => {
      const delta = volume - audio.volume;
      if (Math.abs(delta) < 0.015) {
        audio.volume = volume;
        window.clearInterval(fadeTimer);
        fadeTimer = undefined;
        done?.();
        return;
      }

      audio.volume += delta * 0.18;
    }, 40);
  }

  return {
    start: async () => {
      await audio.play();
      fadeTo(0.34);
    },
    stop: () => {
      fadeTo(0, () => {
        audio.pause();
        audio.src = "";
        URL.revokeObjectURL(url);
      });
    },
  };
}

function createOceanAmbience(): AmbientAudio {
  const AudioContextConstructor =
    window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return createElementAmbience();
  }

  const context = new AudioContextConstructor();
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.0001, context.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 2.4);
  masterGain.connect(context.destination);

  const waveSource = createNoiseSource(context, 4);
  const waveLowpass = context.createBiquadFilter();
  const waveHighpass = context.createBiquadFilter();
  const waveGain = context.createGain();
  const waveLfo = context.createOscillator();
  const waveLfoGain = context.createGain();

  waveLowpass.type = "lowpass";
  waveLowpass.frequency.value = 720;
  waveLowpass.Q.value = 0.5;
  waveHighpass.type = "highpass";
  waveHighpass.frequency.value = 55;
  waveGain.gain.value = 0.14;
  waveLfo.frequency.value = 0.075;
  waveLfoGain.gain.value = 0.065;

  waveLfo.connect(waveLfoGain);
  waveLfoGain.connect(waveGain.gain);
  waveSource.connect(waveLowpass);
  waveLowpass.connect(waveHighpass);
  waveHighpass.connect(waveGain);
  waveGain.connect(masterGain);

  const foamSource = createNoiseSource(context, 2);
  const foamHighpass = context.createBiquadFilter();
  const foamLowpass = context.createBiquadFilter();
  const foamGain = context.createGain();

  foamHighpass.type = "highpass";
  foamHighpass.frequency.value = 1050;
  foamLowpass.type = "lowpass";
  foamLowpass.frequency.value = 2600;
  foamGain.gain.value = 0.018;

  foamSource.connect(foamHighpass);
  foamHighpass.connect(foamLowpass);
  foamLowpass.connect(foamGain);
  foamGain.connect(masterGain);

  const timers = new Set<number>();
  let isStopped = false;

  function scheduleCoastalCall() {
    if (isStopped) return;

    const delay = 12000 + Math.random() * 18000;
    const timer = window.setTimeout(() => {
      if (isStopped) return;

      const now = context.currentTime;
      const callGain = context.createGain();
      const call = context.createOscillator();
      const shimmer = context.createOscillator();

      call.type = "sine";
      shimmer.type = "triangle";
      call.frequency.setValueAtTime(740 + Math.random() * 160, now);
      call.frequency.exponentialRampToValueAtTime(1180, now + 0.22);
      call.frequency.exponentialRampToValueAtTime(660, now + 0.76);
      shimmer.frequency.setValueAtTime(1460 + Math.random() * 240, now);
      shimmer.frequency.exponentialRampToValueAtTime(980, now + 0.68);
      callGain.gain.setValueAtTime(0.0001, now);
      callGain.gain.exponentialRampToValueAtTime(0.018, now + 0.16);
      callGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

      call.connect(callGain);
      shimmer.connect(callGain);
      callGain.connect(masterGain);
      call.start(now);
      shimmer.start(now + 0.04);
      call.stop(now + 1.05);
      shimmer.stop(now + 0.9);

      timers.delete(timer);
      scheduleCoastalCall();
    }, delay);

    timers.add(timer);
  }

  waveSource.start();
  waveLfo.start();
  foamSource.start();
  scheduleCoastalCall();

  return {
    start: () => context.resume(),
    stop: () => {
      if (isStopped) return;

      isStopped = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();

      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      window.setTimeout(() => {
        waveSource.stop();
        waveLfo.stop();
        foamSource.stop();
        context.close().catch(() => undefined);
      }, 900);
    },
  };
}

export default function TideWindowGallery() {
  const galleryRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ambientAudioRef = useRef<AmbientAudio | null>(null);
  const [works, setWorks] = useState<TideWork[]>(FALLBACK_WORKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("mixed");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      void Promise.resolve().then(() => {
        setWorks(shuffle(cached));
        setIsLoading(false);
      });
      return;
    }

    let isMounted = true;

    fetchWorks()
      .then((nextWorks) => {
        if (!isMounted) return;
        const shuffled = shuffle(nextWorks);
        setWorks(shuffled);
        writeCache(shuffled);
      })
      .catch(() => {
        if (isMounted) setWorks(FALLBACK_WORKS);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleWorks = useMemo(() => {
    if (mode === "still") return works.filter((work) => work.kind === "photo");
    if (mode === "motion") return works.filter((work) => work.kind === "video");
    return works;
  }, [mode, works]);

  const currentWork = visibleWorks[currentIndex % visibleWorks.length] ?? works[0];
  const nextWork = visibleWorks[(currentIndex + 1) % visibleWorks.length];
  const hasMotion = works.some((work) => work.kind === "video");

  const goTo = useCallback(
    (direction: 1 | -1) => {
      if (visibleWorks.length === 0) return;
      setCurrentIndex((index) => {
        const next = index + direction;
        return (next + visibleWorks.length) % visibleWorks.length;
      });
    },
    [visibleWorks.length],
  );

  const shuffleCurrent = useCallback(() => {
    if (visibleWorks.length < 2) return;
    setCurrentIndex((index) => {
      let next = Math.floor(Math.random() * visibleWorks.length);
      if (next === index) next = (next + 1) % visibleWorks.length;
      return next;
    });
  }, [visibleWorks.length]);

  const setFilteredMode = useCallback((nextMode: Mode) => {
    setMode(nextMode);
    setCurrentIndex(0);
  }, []);

  const enterFullScreen = useCallback(() => {
    galleryRef.current?.requestFullscreen?.().catch(() => undefined);
  }, []);

  const setGalleryTilt = useCallback((x: number, y: number) => {
    galleryRef.current?.style.setProperty("--tilt-x", `${y.toFixed(3)}deg`);
    galleryRef.current?.style.setProperty("--tilt-y", `${x.toFixed(3)}deg`);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      setGalleryTilt(x * 2.4, y * -1.8);
    },
    [setGalleryTilt],
  );

  const resetGalleryTilt = useCallback(() => {
    setGalleryTilt(0, 0);
  }, [setGalleryTilt]);

  const stopAmbientAudio = useCallback(() => {
    ambientAudioRef.current?.stop();
    ambientAudioRef.current = null;
  }, []);

  const setVideoNativeAudio = useCallback((enabled: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !enabled;
    video.volume = enabled ? 0.72 : 0;

    if (enabled) {
      video.play().catch(() => undefined);
    }
  }, []);

  const startAmbientAudio = useCallback(async () => {
    if (ambientAudioRef.current) return true;

    try {
      const ambient = createOceanAmbience();
      ambientAudioRef.current = ambient;
      await ambient.start();
      return true;
    } catch {
      stopAmbientAudio();
      return false;
    }
  }, [stopAmbientAudio]);

  const toggleSound = useCallback(async () => {
    if (isSoundOn) {
      stopAmbientAudio();
      setVideoNativeAudio(false);
      setIsSoundOn(false);
      return;
    }

    if (currentWork.kind === "video") {
      stopAmbientAudio();
      setVideoNativeAudio(true);
      setIsSoundOn(true);
      return;
    }

    const didStart = await startAmbientAudio();
    setIsSoundOn(didStart);
  }, [
    currentWork.kind,
    isSoundOn,
    setVideoNativeAudio,
    startAmbientAudio,
    stopAmbientAudio,
  ]);

  useEffect(() => {
    if (isPaused || visibleWorks.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % visibleWorks.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, visibleWorks.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(1);
      if (event.key === "ArrowLeft") goTo(-1);
      if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo]);

  useEffect(() => {
    if (!nextWork || nextWork.kind !== "photo") return;

    const image = new Image();
    image.src = nextWork.src;
  }, [nextWork]);

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, [stopAmbientAudio]);

  useEffect(() => {
    if (!isSoundOn) {
      setVideoNativeAudio(false);
      return;
    }

    if (currentWork.kind === "video") {
      stopAmbientAudio();
      setVideoNativeAudio(true);
      return;
    }

    setVideoNativeAudio(false);
    void startAmbientAudio();
  }, [
    currentWork.kind,
    currentWork.id,
    isSoundOn,
    setVideoNativeAudio,
    startAmbientAudio,
    stopAmbientAudio,
  ]);

  useEffect(() => {
    if (currentWork.kind !== "video") {
      videoRef.current = null;
    }
  }, [currentWork.kind, currentWork.id]);

  const captionPlace = currentWork.place ?? "Open Sea";
  const captionDate = formatMediaDate(currentWork.capturedAt);

  return (
    <main
      ref={galleryRef}
      className={styles.room}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        resetGalleryTilt();
      }}
      onPointerMove={handlePointerMove}
    >
      <header className={styles.header} aria-label="Tide Window">
        <h1 className={styles.brand}>Tide Window</h1>
        <nav className={styles.nav} aria-label="Gallery controls">
          <button
            className={mode === "still" ? styles.active : undefined}
            type="button"
            onClick={() => setFilteredMode(mode === "still" ? "mixed" : "still")}
          >
            Still
          </button>
          <button
            className={mode === "motion" ? styles.active : undefined}
            type="button"
            disabled={!hasMotion}
            onClick={() =>
              setFilteredMode(mode === "motion" ? "mixed" : "motion")
            }
          >
            Motion
          </button>
          <button type="button" onClick={shuffleCurrent}>
            Shuffle
          </button>
          <button
            className={isSoundOn ? styles.active : undefined}
            type="button"
            aria-pressed={isSoundOn}
            onClick={toggleSound}
          >
            Sound
          </button>
        </nav>
      </header>

      <section className={styles.stage} aria-live="polite">
        <button
          className={`${styles.edge} ${styles.edgeLeft}`}
          type="button"
          aria-label="Previous sea view"
          onClick={() => goTo(-1)}
        />

        {currentWork.kind === "video" ? (
          <video
            ref={videoRef}
            key={currentWork.id}
            className={styles.work}
            src={currentWork.src}
            poster={currentWork.poster}
            autoPlay
            muted={!isSoundOn}
            loop
            playsInline
            onClick={enterFullScreen}
            onError={() => setFilteredMode("still")}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentWork.id}
            className={styles.work}
            src={currentWork.src}
            alt={currentWork.place ? `Sea view, ${currentWork.place}` : "Sea view"}
            decoding="async"
            onClick={enterFullScreen}
          />
        )}

        <button
          className={`${styles.edge} ${styles.edgeRight}`}
          type="button"
          aria-label="Next sea view"
          onClick={() => goTo(1)}
        />
      </section>

      <p className={styles.caption}>
        {currentWork.capturedAt ? (
          <time dateTime={currentWork.capturedAt}>{captionDate}</time>
        ) : (
          <span>{captionDate}</span>
        )}
        <span aria-hidden="true">·</span>
        <span>{captionPlace}</span>
      </p>

      <div className={styles.progress} aria-hidden="true">
        <span
          className={isLoading || isPaused ? styles.progressPaused : undefined}
        />
      </div>
    </main>
  );
}
