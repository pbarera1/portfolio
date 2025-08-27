// app/api/gmail/messages/route.ts
import { NextResponse } from "next/server";
import { gmailClient } from "@/lib/google";

export async function POST(req: Request) {
  const { labelId, q, maxResults = 50 } = await req.json();
  const gmail = gmailClient();

  const list = await gmail.users.messages.list({
    userId: "me",
    labelIds: labelId ? [labelId] : undefined,
    q, // e.g., "newer_than:1d from:billing@example.com"
    maxResults,
  });

  // fetch basic metadata for each message
  const ids = list.data.messages?.map((m) => m.id!) ?? [];
  const out = [];
  for (const id of ids) {
    const m = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });
    const headers = Object.fromEntries(
      (m.data.payload?.headers ?? []).map((h) => [h.name, h.value])
    );
    out.push({
      id,
      threadId: m.data.threadId,
      snippet: m.data.snippet,
      labelIds: m.data.labelIds,
      from: headers["From"] ?? "",
      to: headers["To"] ?? "",
      subject: headers["Subject"] ?? "",
      date: headers["Date"] ?? "",
      internalDate: m.data.internalDate,
    });
  }

  return NextResponse.json(out);
}
