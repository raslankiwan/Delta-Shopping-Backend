import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: 'mercato-api' } {
    return { status: 'ok', service: 'mercato-api' };
  }
}
