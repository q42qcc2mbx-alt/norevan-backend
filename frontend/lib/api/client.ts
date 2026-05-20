// Typed fetch wrapper for the Express backend at `${API_BASE_URL}/api/v1`.
// Server-side this calls via the internal URL; client-side via the public one.
import "server-only";
import { cookies } from "next/headers";

export const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const API_PREFIX = "/api/v1";
export const AUTH_COOKIE = "norevan_token";

type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: string[];
};

export class ApiError extends Error {
  status: number;
  errors?: string[];
  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // empty/non-json
  }
  if (!res.ok || body?.status === "error") {
    const msg = body?.message ?? `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, body?.errors);
  }
  return (body?.data as T) ?? (undefined as T);
}

async function readToken(): Promise<string | null> {
  try {
    const jar = await cookies();
    return jar.get(AUTH_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

type Options = {
  /** Pass a Bearer token explicitly (otherwise read from the request cookie). */
  token?: string | null;
  /** Don't attach the auth header even if a cookie is present. */
  noAuth?: boolean;
  /** Forward to fetch (revalidate, cache, etc.) */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Forward to fetch */
  cache?: RequestCache;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: Options = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (!opts.noAuth) {
    const token = opts.token ?? (await readToken());
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: opts.cache,
    next: opts.next,
  });
  return unwrap<T>(res);
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>("POST", path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>("PUT", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: Options) =>
    request<T>("DELETE", path, undefined, opts),
};
