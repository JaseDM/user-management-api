import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator'; // ajusta la ruta si cambia

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return { status: 'ok' };
  }
}