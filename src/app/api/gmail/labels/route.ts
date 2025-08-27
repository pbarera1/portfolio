// app/api/gmail/labels/route.ts
import { NextResponse } from "next/server";
import { gmailClient } from "@/lib/google";

export async function GET() {
  const gmail = gmailClient();
  const res = await gmail.users.labels.list({ userId: "me" });
  return NextResponse.json(res.data.labels ?? []);
}
