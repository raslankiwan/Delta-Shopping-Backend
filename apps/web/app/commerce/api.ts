export async function api(path: string, method = "GET", data?: unknown) {
  const response = await fetch(
    path.startsWith("auth/") ? `/api/${path}` : `/api/commerce/${path}`,
    {
      method,
      headers: data ? { "Content-Type": "application/json" } : undefined,
      body: data ? JSON.stringify(data) : undefined,
    },
  );
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}
export function fields(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form));
}
