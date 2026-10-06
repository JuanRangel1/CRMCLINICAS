const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function token() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('accessToken') ?? '';
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(init.headers || {}) },
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
    throw new Error('Não autenticado');
  }
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Erro ${res.status}`);
  }
  return res.json();
}

export function fmt(n: number | undefined | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0);
}

export function dt(d?: string | Date | null) {
  if (!d) return '-';
  return new Date(d).toLocaleString('pt-BR');
}
