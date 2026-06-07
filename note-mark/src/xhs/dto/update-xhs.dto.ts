import { PartialType } from '@nestjs/swagger';
import { CreateXhsDTO } from './create-xhs.dto';

export class UpdateXhsDTO extends PartialType(CreateXhsDTO) {}
