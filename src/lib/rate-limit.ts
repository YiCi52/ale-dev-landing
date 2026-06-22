/*
  Rate limit in-memory para server actions de bajo volumen.

  Sliding window: max N requests por IP en una ventana de tiempo.
  Default: 3 submits / 1 hora — cubre la mayoría de scripts de abuso
  sin bloquear usuarios legítimos.

  LIMITACIÓN: per-server-instance. Vercel puede tener varias instancias
  Edge/Lambda; un atacante distribuido puede saltar entre ellas. Para esta
  landing (volumen bajo, nicho premium) el tradeoff es aceptable. Cuando
  haya >50 leads/mes, migrar a Upstash Ratelimit (Redis distribuido).

  Cleanup: cuando el Map supera 1000 entries, se purgan las expiradas.
*/

const buckets = new Map<string, number[]>();

const DEFAULT_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 3;
const MAP_CLEANUP_THRESHOLD = 1000;

export type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  options?: RateLimitOptions,
): RateLimitResult {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= maxRequests) {
    buckets.set(key, timestamps);
    const oldest = timestamps[0] ?? now;
    return { ok: false, remaining: 0, resetAt: oldest + windowMs };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  if (buckets.size > MAP_CLEANUP_THRESHOLD) {
    cleanup(cutoff);
  }

  return {
    ok: true,
    remaining: maxRequests - timestamps.length,
    resetAt: now + windowMs,
  };
}

function cleanup(cutoff: number): void {
  for (const [k, v] of buckets.entries()) {
    const filtered = v.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      buckets.delete(k);
    } else {
      buckets.set(k, filtered);
    }
  }
}

/* Para tests — reset manual del Map */
export function __resetRateLimitForTests(): void {
  buckets.clear();
}
