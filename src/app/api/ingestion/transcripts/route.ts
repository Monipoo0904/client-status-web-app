import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { seedContracts } from "@/lib/demo-data";
import {
  deriveSourceId,
  generateTaskDrafts,
  inferContractStatusFromContent,
  normalizeSourceId,
  type IngestionRequestBody,
  type IngestionResponseBody
} from "@/lib/ingestion";
import { markIfNew } from "@/lib/ingestion-idempotency";

const SOURCE_TYPE = "Otter Transcript" as const;

export async function POST(request: Request) {
  const configuredSecret = process.env.INGESTION_SHARED_SECRET;
  if (configuredSecret) {
    const providedSecret = request.headers.get("x-ingestion-secret");
    if (providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized ingestion request." }, { status: 401 });
    }
  }

  let body: IngestionRequestBody;
  try {
    body = (await request.json()) as IngestionRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.organization?.trim()) {
    return NextResponse.json({ error: "organization is required." }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required." }, { status: 400 });
  }

  const runId = `ING-${randomUUID()}`;
  const generatedAt = new Date().toISOString();
  const sourceId = body.sourceId?.trim()
    ? body.sourceId.trim()
    : deriveSourceId(SOURCE_TYPE, body.organization, body.content, body.meetingDate);
  const dedupeKey = normalizeSourceId(SOURCE_TYPE, sourceId);

  if (dedupeKey) {
    const dedupeResult = markIfNew(dedupeKey, runId);
    if (dedupeResult.isDuplicate) {
      return NextResponse.json(
        { error: "Duplicate ingestion source detected.", existingRunId: dedupeResult.existingRunId },
        { status: 409 }
      );
    }
  }

  const contract = seedContracts.find(
    (item) => item.organization.toLowerCase() === body.organization.trim().toLowerCase()
  );
  const contractId = body.contractId || contract?.id;
  const taskDrafts = generateTaskDrafts(
    body.content,
    SOURCE_TYPE,
    body.notificationPreference ?? "Email"
  );

  if (!taskDrafts.length) {
    return NextResponse.json(
      { error: "No action items found. Include bullet points or clear next-step sentences." },
      { status: 422 }
    );
  }

  const statusSuggestion = inferContractStatusFromContent(
    body.content,
    contract?.status ?? "Draft",
    SOURCE_TYPE
  );

  const warnings: string[] = [
    "Transcript ingestion is treated as fallback context; validate generated tasks against Valerie's email notes."
  ];

  if (!contractId) {
    warnings.push("No contract matched by organization. Review mapping before finalizing tasks.");
  }

  const response: IngestionResponseBody = {
    runId,
    sourceType: SOURCE_TYPE,
    organization: body.organization.trim(),
    contractId,
    sourceId,
    statusSuggestion,
    generatedAt,
    taskDrafts,
    warnings
  };

  return NextResponse.json(response, { status: 200 });
}
