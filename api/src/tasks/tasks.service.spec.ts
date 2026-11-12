import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from './entities/task.entity';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService(new TasksRepository());
  });

  it('creates a task with TODO status and normalises empty description', () => {
    const task = service.create({ title: 'Test', description: '' });

    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.description).toBeNull();
    expect(service.findOne(task.id)).toEqual(task);
  });

  it('throws NotFoundException for unknown ids', () => {
    expect(() => service.findOne('missing')).toThrow(NotFoundException);
    expect(() => service.update('missing', { title: 'x' })).toThrow(
      NotFoundException,
    );
    expect(() => service.remove('missing')).toThrow(NotFoundException);
  });

  it('filters by status', () => {
    service.create({ title: 'a', status: TaskStatus.DONE });
    service.create({ title: 'b' });

    const done = service.findAll({ status: TaskStatus.DONE });

    expect(done.map((t) => t.title)).toEqual(['a']);
  });

  it('puts tasks without a due date last when sorting by due date', () => {
    service.create({ title: 'none' });
    service.create({ title: 'later', dueDate: '2027-01-02' });
    service.create({ title: 'sooner', dueDate: '2027-01-01' });

    const titles = (order: 'asc' | 'desc') =>
      service.findAll({ sort: 'dueDate', order }).map((t) => t.title);

    expect(titles('asc')).toEqual(['sooner', 'later', 'none']);
    expect(titles('desc')).toEqual(['later', 'sooner', 'none']);
  });
});
