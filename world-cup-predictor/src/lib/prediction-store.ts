import { list, put } from "@vercel/blob";
import { EMPTY_PREDICTION_SNAPSHOT, type PredictionResultSnapshot } from "./prediction-state";

const STORE_PREFIX = "prediction-state/world-cup-results-";
const LEGACY_STORE_PATH = "prediction-state/world-cup-results.json";

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readPredictionSnapshot(): Promise<PredictionResultSnapshot> {
  if (!hasBlobToken()) return EMPTY_PREDICTION_SNAPSHOT;

  try {
    const blobs = await list({ prefix: STORE_PREFIX, limit: 100 });
    const blob = blobs.blobs
      .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime())[0];
    const legacyBlob = blob ? null : (await list({ prefix: LEGACY_STORE_PATH, limit: 1 })).blobs
      .find((item) => item.pathname === LEGACY_STORE_PATH);
    const selectedBlob = blob ?? legacyBlob;
    if (!selectedBlob) return EMPTY_PREDICTION_SNAPSHOT;

    const response = await fetch(`${selectedBlob.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return EMPTY_PREDICTION_SNAPSHOT;

    return await response.json() as PredictionResultSnapshot;
  } catch {
    return EMPTY_PREDICTION_SNAPSHOT;
  }
}

export async function writePredictionSnapshot(snapshot: PredictionResultSnapshot) {
  if (!hasBlobToken()) {
    return {
      persisted: false,
      reason: "BLOB_READ_WRITE_TOKEN is not configured"
    };
  }

  const safeTimestamp = snapshot.updatedAt.replace(/[:.]/g, "-");
  const blob = await put(`${STORE_PREFIX}${safeTimestamp}.json`, JSON.stringify(snapshot, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json"
  });

  return {
    persisted: true,
    url: blob.url
  };
}
