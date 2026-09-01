import { NextRequest } from "next/server";
import { API_BASE, backendFetch, NotAuthenticatedError, unauthorizedResponse } from "@/lib/backend";

export async function GET() {
  try {
    const res = await backendFetch("/links/");
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return unauthorizedResponse();
    throw e;
  }
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
