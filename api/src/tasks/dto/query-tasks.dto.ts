import { IsIn, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export const SORT_FIELDS = ['createdAt', 'dueDate'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsIn(SORT_FIELDS)
  sort?: SortField;

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: SortOrder;
}
