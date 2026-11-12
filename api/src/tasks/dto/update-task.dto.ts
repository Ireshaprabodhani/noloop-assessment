import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// skipNullProperties: false -> fields may be omitted, but an explicit `null`
// is still validated. That keeps `{ "title": null }` a 400, while fields that
// are nullable on CreateTaskDto (description, dueDate) can still be cleared.
export class UpdateTaskDto extends PartialType(CreateTaskDto, {
  skipNullProperties: false,
}) {}
