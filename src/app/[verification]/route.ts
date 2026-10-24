import { NextResponse } from "next/server";

type Params = { params: Promise<{ verification: string }> };

// Google Search Console's HTML-file method only requires the requested root URL
// to return this exact filename-based body. This route supports the verification
// filename Google issues without hard-coding a single, brittle token in routing.
export async function GET(_request: Request, { params }: Params) {
  const { verification } = await params;
  if (!/^google[A-Za-z0-9_-]+\.html$/.test(verification)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(`google-site-verification: ${verification}`, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
