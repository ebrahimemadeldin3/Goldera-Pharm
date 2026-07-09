"use server";

// Server-side storage for last API request time
let lastApiRequestTime: number | null = null;

export async function updateLastApiRequestTime(): Promise<void> {
  lastApiRequestTime = Date.now();
}

export async function getLastApiRequestTime(): Promise<number | null> {
  return lastApiRequestTime;
}

export async function getLastRefreshTimeAction() {
  const timestamp = await getLastApiRequestTime();

  if (!timestamp) {
    return null;
  }

  return {
    timestamp,
    iso: new Date(timestamp).toISOString(),
  };
}
