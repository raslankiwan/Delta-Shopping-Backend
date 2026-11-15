import { mkdirSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

/**
 * Directory where uploaded media is stored (and served from at /uploads).
 * Defaults to <cwd>/uploads; override with UPLOADS_DIR (e.g. a mounted volume
 * in production). Created on first use.
 */
export function uploadsDir(): string {
  const configured = process.env.UPLOADS_DIR;
  const dir = configured
    ? isAbsolute(configured)
      ? configured
      : join(process.cwd(), configured)
    : join(process.cwd(), 'uploads');
  mkdirSync(dir, { recursive: true });
  return dir;
}
