export function getCache<T>(key: string): T | null {
    const localRaw = localStorage.getItem(`localCache_${key}`);
    if (localRaw == null) return null;

    const { ttl, data }: { ttl: number | null, data: unknown } = JSON.parse(localRaw);
    if (ttl != null && new Date(ttl).getTime() > new Date().getTime()) {
        return data as T;
    }

    localStorage.removeItem(`localCache_${key}`);
    return null;
}

export function setCache<T>(key: string, value: T, ttl?: number) {
    const record = { ttl: ttl != null ? new Date().getTime() + ttl : null, data: value };
    localStorage.setItem(`localCache_${key}`, JSON.stringify(record));
}
