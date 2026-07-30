// Prevents the same email/transcript from being ingested twice (e.g. a retried
// webhook call). In-memory only: this map resets on server restart/redeploy,
// so it dedupes within a running process, not permanently.
const seenSourceIds = new Map<string, string>();

// Call once per ingestion request with the source's dedupe key. Returns
// isDuplicate: true (plus the original run's ID) if this sourceId was already
// processed; otherwise records it as seen and returns false.
export function markIfNew(sourceId: string, runId: string) {
  const existingRunId = seenSourceIds.get(sourceId);
  if (existingRunId) {
    return { isDuplicate: true as const, existingRunId };
  }

  seenSourceIds.set(sourceId, runId);
  return { isDuplicate: false as const };
}
