// Server-side fetch helper for Next.js server components calling the Express backend.
// Forwards the browser's cookies so the backend can authenticate the request.
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

export async function backendFetch<T = unknown>(path: string): Promise<T | null> {
  const cookieStore = cookies()
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${encodeURIComponent(c.value)}`).join('; ')
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}
