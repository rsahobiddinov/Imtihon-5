import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}