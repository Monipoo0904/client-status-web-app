import { createHash } from "node:crypto";
import type { ContractStatus, NotificationChannel, TaskPriority, WorkflowSourceType } from "@/lib/demo-data";

export type IngestionSourceType = Exclude<WorkflowSourceType, "Manual">;

export type IngestionRequestBody = {
  organization: string;
  content: string;
  sourceId?: string;
  meetingDate?: string;
  notificationPreference?: NotificationChannel;
  contractId?: string;
};

export type IngestionTaskDraft = {
  title: string;
  summary: string;
  priority: TaskPriority;
  dueDate: string;
  notificationPreference: NotificationChannel;
};

export type IngestionResponseBody = {
  runId: string;
  sourceType: IngestionSourceType;
  organization: string;
  contractId?: string;
  sourceId: string;
  statusSuggestion: ContractStatus;
  generatedAt: string;
  taskDrafts: IngestionTaskDraft[];
  warnings: string[];
};

export function normalizeSourceId(sourceType: IngestionSourceType, sourceId?: string) {
  if (sourceId && sourceId.trim()) {
    return `${sourceType}:${sourceId.trim().toLowerCase()}`;
  }

  return "";
}

export function deriveSourceId(sourceType: IngestionSourceType, organization: string, content: string, meetingDate?: string) {
  const hashInput = `${sourceType}|${organization}|${meetingDate ?? ""}|${content}`;
  const digest = createHash("sha256").update(hashInput).digest("hex").slice(0, 16);
  return `${sourceType.toLowerCase().replace(/\s+/g, "-")}-${digest}`;
}

export function extractActionItems(rawText: string) {
  const bulletMatches = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line))
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, ""))
    .filter(Boolean);

  if (bulletMatches.length) {
    return bulletMatches;
  }

  return rawText
    .split(/[.!?]\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 5);
}

export function inferPriorityFromLine(line: string): TaskPriority {
  const normalized = line.toLowerCase();
  if (/(urgent|asap|critical|today|blocker)/.test(normalized)) {
    return "High";
  }

  if (/(later|backlog|follow up|eventually)/.test(normalized)) {
    return "Low";
  }

  return "Medium";
}

export function inferDueDateFromLine(line: string, baseDate: Date) {
  const normalized = line.toLowerCase();
  const due = new Date(baseDate);

  if (/(today|asap|urgent)/.test(normalized)) {
    due.setDate(due.getDate() + 1);
  } else if (/tomorrow/.test(normalized)) {
    due.setDate(due.getDate() + 1);
  } else if (/next week/.test(normalized)) {
    due.setDate(due.getDate() + 7);
  } else {
    due.setDate(due.getDate() + 3);
  }

  return due.toISOString().slice(0, 10);
}

export function inferContractStatusFromContent(
  rawText: string,
  currentStatus: ContractStatus,
  sourceType: IngestionSourceType
): ContractStatus {
  const normalized = rawText.toLowerCase();
  if (/(blocked|delay|risk|issue|stuck)/.test(normalized)) {
    return "At Risk";
  }

  if (sourceType === "Meeting Email" && currentStatus !== "Closed") {
    return "Active";
  }

  return currentStatus;
}

export function generateTaskDrafts(
  rawText: string,
  sourceType: IngestionSourceType,
  notificationPreference: NotificationChannel,
  now = new Date()
) {
  const actionItems = extractActionItems(rawText);

  return actionItems.map((item) => ({
    title: item.slice(0, 72),
    summary: `Created from ${sourceType.toLowerCase()} ingestion.`,
    priority: inferPriorityFromLine(item),
    dueDate: inferDueDateFromLine(item, now),
    notificationPreference
  }));
}
