import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';

@Module({
    imports: [EntitiesModule]
})
export class RoleModule { }
