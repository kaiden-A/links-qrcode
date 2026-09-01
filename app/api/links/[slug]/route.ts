import { NextRequest } from "next/server";
import { backendFetch, NotAuthenticatedError, unauthorizedResponse } from "@/lib/backend";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await backendFetch(`/links/${encodeURIComponent(slug)}`);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return unauthorizedResponse();
    throw e;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  try {
    const res = await backendFetch(`/links/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return unauthorizedResponse();
    throw e;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await backendFetch(`/links/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return unauthorizedResponse();
    throw e;
  }
}
