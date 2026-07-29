const seenSourceIds = new Map<string, string>();

export function markIfNew(sourceId: string, runId: string) {
  const existingRunId = seenSourceIds.get(sourceId);
  if (existingRunId) {
    return { isDuplicate: true as const, existingRunId };
  }

  seenSourceIds.set(sourceId, runId);
  return { isDuplicate: false as const };
}
