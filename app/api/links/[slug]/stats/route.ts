import { backendFetch, NotAuthenticatedError, unauthorizedResponse } from "@/lib/backend";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await backendFetch(`/links/${encodeURIComponent(slug)}/stats`);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return unauthorizedResponse();
    throw e;
  }
}
