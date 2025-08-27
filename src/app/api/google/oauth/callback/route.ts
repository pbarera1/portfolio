// app/api/google/oauth/callback/route.ts
import { NextResponse } from "next/server";
import { oauthClient } from "@/lib/google";
import { saveTokens } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=missing_code", req.url));

  const client = await oauthClient();
  const { tokens } = await client.getToken(code);
  // Persist access+refresh
  saveTokens(tokens);
  return NextResponse.redirect(new URL("/kisco/gmail", req.url)); // go to a page that uses the API
}
