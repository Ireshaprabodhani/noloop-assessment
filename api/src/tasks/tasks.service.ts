import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly repository: TasksRepository) {}

  findAll(query: QueryTasksDto = {}): Task[] {
    const { status, sort = 'createdAt', order } = query;

    const tasks = status
      ? this.repository.findAll().filter((task) => task.status === status)
      : this.repository.findAll();

    if (sort === 'dueDate') {
      return tasks.sort(compareByDueDate(order ?? 'asc'));
    }
    return tasks.sort(compareByCreatedAt(order ?? 'desc'));
  }

  findOne(id: string): Task {
    const task = this.repository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: emptyToNull(dto.description),
      status: dto.status ?? TaskStatus.TODO,
      dueDate: dto.dueDate ?? null,
      createdAt: new Date().toISOString(),
    };
    return this.repository.save(task);
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const existing = this.findOne(id);
    const updated: Task = {
      ...existing,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && {
        description: emptyToNull(dto.description),
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
    };
    return this.repository.save(updated);
  }

  remove(id: string): void {
    if (!this.repository.delete(id)) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  return value ? value : null;
}

function compareByCreatedAt(order: 'asc' | 'desc') {
  const direction = order === 'asc' ? 1 : -1;
  return (a: Task, b: Task) =>
    a.createdAt.localeCompare(b.createdAt) * direction;
}

// Tasks without a due date always go last, regardless of direction.
function compareByDueDate(order: 'asc' | 'desc') {
  const direction = order === 'asc' ? 1 : -1;
  return (a: Task, b: Task) => {
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return (Date.parse(a.dueDate) - Date.parse(b.dueDate)) * direction;
  };
}
