import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** RFC 9457 problem+json body. */
interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  code: string;
  errors?: { field: string; code: string; message: string }[];
}

const ERROR_BASE = 'https://errors.mercato.dev/';

/**
 * Renders every error as RFC 9457 `application/problem+json` with a stable,
 * machine-readable `code`, so all clients handle failures uniformly.
 */
@Catch()
export class ProblemJsonExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const problem = this.toProblem(exception);

    res
      .status(problem.status)
      .setHeader('Content-Type', 'application/problem+json')
      .setHeader('X-Request-Id', (req.headers['x-request-id'] as string) ?? '')
      .json(problem);
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const { code, detail } = normalizeHttpBody(response);
      return {
        type: `${ERROR_BASE}${code}`,
        title: exception.name.replace(/Exception$/, ''),
        status,
        code,
        detail,
      };
    }

    // Unknown/unexpected: do not leak internals.
    return {
      type: `${ERROR_BASE}internal`,
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_error',
    };
  }
}

function normalizeHttpBody(response: string | object): { code: string; detail?: string } {
  if (typeof response === 'string') return { code: 'error', detail: response };
  const body = response as Record<string, unknown>;
  const code = typeof body.code === 'string' ? body.code : 'error';
  const detail =
    typeof body.detail === 'string'
      ? body.detail
      : typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(', ')
          : undefined;
  return { code, detail };
}
