"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "lhbd-cookie-consent";
const SESSION_KEY = "lhbd-visitor-session";

function visitorSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

/**
 * Records one anonymous browsing session and refreshes it as visitors move
 * around the public site. This deliberately uses sessionStorage (not a
 * persistent fingerprint) and waits for analytics consent.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(localStorage.getItem(CONSENT_KEY) === "accepted");
    };
    syncConsent();
    window.addEventListener("lhbd-cookie-consent", syncConsent);
    return () => window.removeEventListener("lhbd-cookie-consent", syncConsent);
  }, []);

  useEffect(() => {
    // Admin routes are intentionally excluded so the visitor desk stays focused
    // on public traffic rather than staff browsing the dashboard.
    if (!enabled || pathname.startsWith("/admin")) return;

    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: visitorSessionId(),
        path: pathname,
      }),
      keepalive: true,
    }).catch(() => {
      // Visitor diagnostics must never interrupt the public experience.
    });
  }, [enabled, pathname]);

  return null;
}
