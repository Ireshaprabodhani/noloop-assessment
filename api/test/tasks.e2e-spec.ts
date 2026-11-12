import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import type { Task } from '../src/tasks/entities/task.entity';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('Tasks API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    // A fresh module per test gives each test an empty in-memory store.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const createTask = async (body: Record<string, unknown>): Promise<Task> => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(body)
      .expect(201);
    return res.body as Task;
  };

  describe('POST /tasks', () => {
    it('creates a task with defaults', async () => {
      const task = await createTask({ title: '  Write README  ' });

      expect(task).toMatchObject({
        title: 'Write README',
        description: null,
        status: 'TODO',
        dueDate: null,
      });
      expect(task.id).toEqual(expect.any(String));
      expect(Date.parse(task.createdAt)).not.toBeNaN();
    });

    it('creates a task with all fields', async () => {
      const task = await createTask({
        title: 'Ship it',
        description: 'Before Friday',
        status: 'IN_PROGRESS',
        dueDate: '2026-12-31',
      });

      expect(task).toMatchObject({
        title: 'Ship it',
        description: 'Before Friday',
        status: 'IN_PROGRESS',
        dueDate: '2026-12-31',
      });
    });

    it.each([
      ['missing title', {}],
      ['blank title', { title: '   ' }],
      ['non-string title', { title: 42 }],
      ['invalid status', { title: 'x', status: 'BLOCKED' }],
      ['invalid dueDate', { title: 'x', dueDate: 'next week' }],
      ['unknown property', { title: 'x', priority: 'high' }],
    ])('returns 400 for %s', async (_label, body) => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send(body)
        .expect(400);

      expect(res.body.message).toEqual(expect.any(Array));
    });
  });

  describe('GET /tasks', () => {
    it('returns an empty list initially', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
    });

    it('filters by status', async () => {
      await createTask({ title: 'a', status: 'TODO' });
      await createTask({ title: 'b', status: 'DONE' });

      const res = await request(app.getHttpServer())
        .get('/tasks?status=DONE')
        .expect(200);

      expect((res.body as Task[]).map((t) => t.title)).toEqual(['b']);
    });

    it('sorts by due date with undated tasks last', async () => {
      await createTask({ title: 'none' });
      await createTask({ title: 'late', dueDate: '2027-03-01' });
      await createTask({ title: 'early', dueDate: '2026-12-01' });

      const asc = await request(app.getHttpServer())
        .get('/tasks?sort=dueDate&order=asc')
        .expect(200);
      expect((asc.body as Task[]).map((t) => t.title)).toEqual([
        'early',
        'late',
        'none',
      ]);

      const desc = await request(app.getHttpServer())
        .get('/tasks?sort=dueDate&order=desc')
        .expect(200);
      expect((desc.body as Task[]).map((t) => t.title)).toEqual([
        'late',
        'early',
        'none',
      ]);
    });

    it('returns 400 for invalid query params', async () => {
      await request(app.getHttpServer()).get('/tasks?status=NOPE').expect(400);
      await request(app.getHttpServer()).get('/tasks?sort=title').expect(400);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns the task', async () => {
      const task = await createTask({ title: 'find me' });

      await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .expect(200)
        .expect(task);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/${MISSING_ID}`)
        .expect(404);
    });

    it('returns 400 for a malformed id', async () => {
      await request(app.getHttpServer()).get('/tasks/not-a-uuid').expect(400);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('updates only the provided fields', async () => {
      const task = await createTask({
        title: 'old',
        description: 'keep me',
        dueDate: '2026-12-31',
      });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ title: 'new', status: 'DONE' })
        .expect(200);

      expect(res.body).toEqual({
        ...task,
        title: 'new',
        status: 'DONE',
      });
    });

    it('clears nullable fields when null is sent', async () => {
      const task = await createTask({
        title: 't',
        description: 'd',
        dueDate: '2026-12-31',
      });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ description: null, dueDate: null })
        .expect(200);

      expect(res.body).toMatchObject({ description: null, dueDate: null });
    });

    it('returns 400 for invalid input', async () => {
      const task = await createTask({ title: 't' });

      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ title: null })
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ status: 'nope' })
        .expect(400);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${MISSING_ID}`)
        .send({ title: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deletes the task', async () => {
      const task = await createTask({ title: 'bye' });

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .expect(404);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${MISSING_ID}`)
        .expect(404);
    });
  });
});
