// lib/session.ts
import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { Credentials } from "google-auth-library";

const NAME = "gmail_tokens";
const key = crypto.createHash("sha256").update(process.env.SESSION_SECRET!).digest();

export async function saveTokens(tokens: Credentials) {
  const data = Buffer.from(JSON.stringify(tokens), "utf8");
  // simple XOR "encryption" example; replace with iron-session/jose JWE in prod
  const enc = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) enc[i] = data[i] ^ key[i % key.length];

  const cookieStore = await cookies();
  cookieStore.set(NAME, enc.toString("base64"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function loadTokens<T = Credentials>(): Promise<T | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(NAME)?.value;
  if (!c) return null;
  const buf = Buffer.from(c, "base64");
  const dec = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) dec[i] = buf[i] ^ key[i % key.length];
  try { return JSON.parse(dec.toString("utf8")); } catch { return null; }
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.set(NAME, "", { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 0 });
}
