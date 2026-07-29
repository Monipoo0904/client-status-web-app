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

const ACTION_SECTION_HEADER_PATTERN = /^(next steps?|action steps?|to-?dos?|follow[- ]?ups?)\s*:?\s*(.*)$/i;
const SECTION_HEADER_LINE_PATTERN = /^[A-Za-z][A-Za-z /]*:$/;
const SPEAKER_PREFIX_PATTERN = /^([A-Z]\.){1,3}:?\s*/;
const DISCUSSION_LEAD_PATTERN =
  /^(how|what|why|when|where|should|does|is|are|do|did|can|would|could|discussion on|q\/?a|note|options?)\b/i;
const ACTION_VERB_PATTERN =
  /\b(connect|send|review|confirm|schedule|finalize|create|build|follow up|incorporate|expand|prepare|provide|submit|share|deliver|weave|publish|customize|coordinate|monitor|set up|update|draft)\b/i;

function stripSpeakerPrefix(line: string) {
  return line.replace(SPEAKER_PREFIX_PATTERN, "").trim();
}

function isLikelyDiscussionLine(line: string) {
  if (!line) {
    return true;
  }

  if (line.endsWith("?")) {
    return true;
  }

  return DISCUSSION_LEAD_PATTERN.test(line);
}

function extractFromActionSections(lines: string[]) {
  const items: string[] = [];
  let collecting = false;

  for (const line of lines) {
    const headerMatch = line.match(ACTION_SECTION_HEADER_PATTERN);
    if (headerMatch) {
      collecting = true;
      const inlineRemainder = stripSpeakerPrefix(headerMatch[2] ?? "");
      if (inlineRemainder && !isLikelyDiscussionLine(inlineRemainder)) {
        items.push(inlineRemainder);
      }
      continue;
    }

    if (!collecting) {
      continue;
    }

    if (!line || SECTION_HEADER_LINE_PATTERN.test(line)) {
      collecting = false;
      continue;
    }

    const cleaned = stripSpeakerPrefix(line);
    if (!isLikelyDiscussionLine(cleaned)) {
      items.push(cleaned);
    }
  }

  return items;
}

function extractActionVerbLines(lines: string[]) {
  return lines
    .map((line) => stripSpeakerPrefix(line))
    .filter((line) => line.length >= 15 && line.length <= 140)
    .filter((line) => !isLikelyDiscussionLine(line))
    .filter((line) => ACTION_VERB_PATTERN.test(line));
}

export function extractActionItems(rawText: string) {
  const lines = rawText.split("\n").map((line) => line.trim());

  const bulletMatches = lines
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line))
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, ""))
    .filter(Boolean);

  if (bulletMatches.length) {
    return bulletMatches;
  }

  const sectionItems = extractFromActionSections(lines);
  const scannedItems = extractActionVerbLines(lines);
  const combined = Array.from(new Set([...sectionItems, ...scannedItems].filter(Boolean)));

  if (combined.length) {
    return combined.slice(0, 8);
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
