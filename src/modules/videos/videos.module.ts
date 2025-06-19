import { Module } from '@nestjs/common';
import { MovieService } from './videos.service';
import { MovieController } from './videos.controller';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}