import { getSession } from "@/lib/session";

export const API_BASE = "https://api.motionukict.com/api/v1/link-shorterner";

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated.");
    this.name = "NotAuthenticatedError";
  }
}

export async function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  if (!session) {
    throw new NotAuthenticatedError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export function unauthorizedResponse() {
  return Response.json({ error: "Not authenticated." }, { status: 401 });
}
