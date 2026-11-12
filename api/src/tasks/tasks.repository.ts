import { Injectable } from '@nestjs/common';
import type { Task } from './entities/task.entity';

/**
 * In-memory storage for tasks. Data lives only as long as the process.
 * Kept behind its own class so it could be swapped for a database later
 * without touching the service.
 */
@Injectable()
export class TasksRepository {
  private readonly tasks = new Map<string, Task>();

  findAll(): Task[] {
    return [...this.tasks.values()];
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  save(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
