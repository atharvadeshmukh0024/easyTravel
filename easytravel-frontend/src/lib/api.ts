// src/lib/api.ts
export async function apiRequest(
  path: string,
  method: string = "GET",
  body?: any
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // ✅ backend URL

  const res = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}
