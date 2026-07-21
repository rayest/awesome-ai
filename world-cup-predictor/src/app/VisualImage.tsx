"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useEffect } from "react";

const WIKI_SUMMARY_PREFIX = "wiki-summary:";

function wikiSummaryUrl(title: string) {
  const pageTitle = title.trim().replace(/\s+/g, "_");
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
}

export default function VisualImage({
  alt,
  className,
  fallbackSrc,
  src
}: {
  alt: string;
  className?: string;
  fallbackSrc?: string;
  src: string;
}) {
  const isWikiSummary = src.startsWith(WIKI_SUMMARY_PREFIX);
  const [wikiImage, setWikiImage] = useState<{ imageSrc?: string; sourceSrc: string }>({ sourceSrc: src });
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = isWikiSummary
    ? wikiImage.sourceSrc === src
      ? wikiImage.imageSrc ?? fallbackSrc ?? ""
      : fallbackSrc ?? ""
    : src;
  const currentSrc = failedSrc === resolvedSrc && fallbackSrc ? fallbackSrc : resolvedSrc;

  useEffect(() => {
    let cancelled = false;

    if (!isWikiSummary) {
      return () => {
        cancelled = true;
      };
    }

    const title = src.slice(WIKI_SUMMARY_PREFIX.length);

    fetch(wikiSummaryUrl(title))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Wikipedia image lookup failed: ${response.status}`);
        }
        return response.json() as Promise<{
          originalimage?: { source?: string };
          thumbnail?: { source?: string };
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        const resolvedSrc = data.thumbnail?.source ?? data.originalimage?.source ?? fallbackSrc;
        if (resolvedSrc) {
          setWikiImage({ imageSrc: resolvedSrc, sourceSrc: src });
        }
      })
      .catch(() => {
        if (!cancelled && fallbackSrc) {
          setWikiImage({ imageSrc: fallbackSrc, sourceSrc: src });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackSrc, isWikiSummary, src]);

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setFailedSrc(currentSrc);
        }
      }}
      src={currentSrc}
    />
  );
}
