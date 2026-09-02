import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/mycareersfuture";

export async function POST(request: Request) {
  let role: unknown;
  try {
    ({ role } = await request.json());
  } catch {
    return NextResponse.json({ status: "error", error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof role !== "string" || !role.trim()) {
    return NextResponse.json({ status: "error", error: "role is required" }, { status: 400 });
  }

  try {
    const data = await fetchMarketSnapshot(role);
    return NextResponse.json({ status: "ok", data });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Market data lookup failed" },
      { status: 502 }
    );
  }
}
