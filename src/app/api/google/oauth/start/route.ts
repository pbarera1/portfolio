// app/api/google/oauth/start/route.ts
import { NextResponse } from "next/server";
import { oauthClient, GMAIL_SCOPES } from "@/lib/google";

export async function GET() {
  const client = oauthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    prompt: "consent", // ensure refresh_token on first run
  });
  return NextResponse.redirect(url);
}
