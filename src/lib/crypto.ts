/**
 * Cryptographic helpers for blind stage agreements using the browser Web Crypto API
 */

export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function hashStageChoice(stageId: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${stageId.trim().toLowerCase()}:${salt.trim()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyStageChoice(stageId: string, salt: string, expectedHash: string): Promise<boolean> {
  const computed = await hashStageChoice(stageId, salt);
  return computed.toLowerCase() === expectedHash.toLowerCase();
}
