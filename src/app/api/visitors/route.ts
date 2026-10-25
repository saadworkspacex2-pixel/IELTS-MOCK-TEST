import { NextResponse } from "next/server";
import { db } from "@/db";
import { visitorLogs } from "@/db/schema";
import { sql } from "drizzle-orm";

function truncate(value: string, max: number) {
  return value.slice(0, max);
}

function geoValue(value: string | null) {
  if (!value) return "";
  try {
    return truncate(decodeURIComponent(value.replace(/\+/g, " ")), 160);
  } catch {
    return truncate(value, 160);
  }
}

function visitorDevice(userAgent: string) {
  const ua = userAgent || "";
  const browser = /Edg\//.test(ua)
    ? "Microsoft Edge"
    : /OPR\//.test(ua) || /Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /CriOS\//.test(ua) || /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown browser";
  const device = /iPad/.test(ua)
    ? "iPad"
    : /iPhone/.test(ua)
      ? "iPhone"
      : /Android/.test(ua) && /Mobile/.test(ua)
        ? "Android phone"
        : /Android/.test(ua)
          ? "Android tablet"
          : "Desktop / laptop";
  const operatingSystem = /Windows NT/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)
      ? "macOS"
      : /iPhone|iPad/.test(ua)
        ? "iOS"
        : /Android/.test(ua)
          ? "Android"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown OS";
  return { browser, device, operatingSystem };
}

function requestIp(req: Request) {
  return truncate(
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "",
    100,
  );
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    return NextResponse.json({ error: "Origin required" }, { status: 403 });
  }
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const path = typeof body?.path === "string" ? body.path.trim() : "";
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(sessionId) || !path.startsWith("/") || path.length > 300) {
    return NextResponse.json({ error: "Invalid visitor data" }, { status: 400 });
  }

  const userAgent = truncate(req.headers.get("user-agent") || "", 1500);
  const device = visitorDevice(userAgent);
  const now = new Date();
  const values = {
    ip: requestIp(req),
    country: geoValue(req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry")),
    region: geoValue(req.headers.get("x-vercel-ip-country-region")),
    city: geoValue(req.headers.get("x-vercel-ip-city")),
    browser: device.browser,
    device: device.device,
    operatingSystem: device.operatingSystem,
    userAgent,
  };

  await db
    .insert(visitorLogs)
    .values({
      sessionId,
      ...values,
      entryPath: path,
      lastPath: path,
      firstSeen: now,
      lastSeen: now,
      pageViews: 1,
    })
    .onConflictDoUpdate({
      target: visitorLogs.sessionId,
      set: {
        ...values,
        lastPath: path,
        lastSeen: now,
        pageViews: sql`${visitorLogs.pageViews} + 1`,
      },
    });

  return new NextResponse(null, { status: 204 });
}
