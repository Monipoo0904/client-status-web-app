import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "SLACK_BOT_TOKEN is not configured." }, { status: 501 });
  }

  let body: { text?: string; channel?: string };
  try {
    body = (await request.json()) as { text?: string; channel?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  if (!body.channel?.trim()) {
    return NextResponse.json({ error: "channel is required." }, { status: 400 });
  }

  const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${botToken}`
    },
    body: JSON.stringify({ channel: body.channel, text: body.text })
  });

  const payload = (await slackResponse.json()) as { ok: boolean; error?: string };

  if (!slackResponse.ok || !payload.ok) {
    return NextResponse.json(
      { error: `Slack request failed: ${payload.error ?? slackResponse.statusText}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
