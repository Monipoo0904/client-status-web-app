// Thin server-side proxy to Slack's chat.postMessage. Exists so the bot
// token never reaches the browser — page.tsx calls this route with a
// { text, channel } body instead of hitting Slack's API directly.
//
// Uses a bot token + explicit channel ID (chat.postMessage), not an incoming
// webhook, because webhooks bake in a single fixed channel at creation time
// and can't target a different channel per contract folder the way this app
// needs (each contract can have its own slackChannelId in demo-data.ts).
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    // Callers (see notifySlackUpdate/notifySlackAssignment in page.tsx)
    // deliberately swallow this error rather than surface it as a blocking
    // failure — Slack notifications are best-effort, not required for the
    // core app to function.
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
