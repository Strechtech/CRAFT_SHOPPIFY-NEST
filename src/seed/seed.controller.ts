import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}
  
  @Get()
  @ApiOperation({ summary: 'Reinicializar usuarios y productos de ejemplo (bootstrap)' })
  @ApiResponse({ status: 200, description: 'Seed ejecutado correctamente' })
  executeSeed() {
    return this.seedService.runSeed();
  }

}
