import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { CreateAdminCommand } from './create-admin.command';

@Module({
  imports: [ConsoleModule],
  providers: [CreateAdminCommand],
  exports: [CreateAdminCommand],
})
export class CommandsModule {}
