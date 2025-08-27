// lib/google.ts
import { google } from "googleapis";
import { loadTokens, saveTokens } from "./session";
import type { Credentials } from "google-auth-library";

export function oauthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  const tokens = loadTokens();
  if (tokens) client.setCredentials(tokens as Credentials);
  return client;
}

export function gmailClient() {
  const auth = oauthClient();
  return google.gmail({ version: "v1", auth });
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly", // or gmail.modify
];
