import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsResolver } from './graphql/reports.resolver';

@Module({
  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}
