import { NextRequest } from "next/server";

const API_BASE = "https://api.motionukict.com/api/v1/link-shorterner";

export async function GET() {
  const res = await fetch(`${API_BASE}/links/`);
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${API_BASE}/links/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
