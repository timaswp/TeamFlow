import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { isDatabaseReachable, resetDatabase, uniqueEmail } from './helpers';

const app = createApp();
const password = 'Password123!';

let dbAvailable = false;

beforeAll(async () => {
  dbAvailable = await isDatabaseReachable();
  if (dbAvailable) {
    await resetDatabase();
  } else {
    console.warn('Skipping integration tests: PostgreSQL is not reachable.');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function registerUser(name: string) {
  const email = uniqueEmail(name.toLowerCase().replace(/\s/g, '.'));
  const response = await request(app).post('/api/auth/register').send({ name, email, password });
  return { email, token: response.body.token as string, user: response.body.user };
}

describe('health', () => {
  it('reports ok without authentication', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe.runIf(process.env.SKIP_DB_TESTS !== 'true')('API integration', () => {
  it('registers a user and returns a token without the password hash', async () => {
    if (!dbAvailable) return;
    const email = uniqueEmail('register');
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email, password });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects invalid registration payloads', async () => {
    if (!dbAvailable) return;
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('logs in with valid credentials and rejects wrong passwords', async () => {
    if (!dbAvailable) return;
    const { email } = await registerUser('Login User');

    const ok = await request(app).post('/api/auth/login').send({ email, password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    const bad = await request(app).post('/api/auth/login').send({ email, password: 'wrong-pass' });
    expect(bad.status).toBe(401);
  });

  it('protects /api/auth/me', async () => {
    if (!dbAvailable) return;
    const anonymous = await request(app).get('/api/auth/me');
    expect(anonymous.status).toBe(401);

    const { token, user } = await registerUser('Me User');
    const authorized = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(authorized.status).toBe(200);
    expect(authorized.body.id).toBe(user.id);
  });

  it('creates a project and makes the creator its owner', async () => {
    if (!dbAvailable) return;
    const { token, user } = await registerUser('Owner User');

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Course Project', description: 'Demo', deadline: '2026-12-01' });

    expect(response.status).toBe(201);
    expect(response.body.progress).toBe(0);

    const membership = await prisma.projectMember.findFirst({
      where: { projectId: response.body.id, userId: user.id },
    });
    expect(membership?.role).toBe('OWNER');
  });

  it('forbids access to projects the user is not a member of', async () => {
    if (!dbAvailable) return;
    const owner = await registerUser('Project Owner');
    const outsider = await registerUser('Outsider');

    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Private Project' });

    const response = await request(app)
      .get(`/api/projects/${created.body.id}`)
      .set('Authorization', `Bearer ${outsider.token}`);

    expect(response.status).toBe(403);
  });

  it('creates tasks and rejects assignees outside the project', async () => {
    if (!dbAvailable) return;
    const owner = await registerUser('Task Owner');
    const outsider = await registerUser('Task Outsider');

    const project = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Task Project' });

    const created = await request(app)
      .post(`/api/projects/${project.body.id}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Write tests', priority: 'HIGH', assigneeId: owner.user.id });

    expect(created.status).toBe(201);
    expect(created.body.status).toBe('TODO');

    const invalidAssignee = await request(app)
      .post(`/api/projects/${project.body.id}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Bad assignee', assigneeId: outsider.user.id });

    expect(invalidAssignee.status).toBe(400);
  });

  it('rejects invalid task data', async () => {
    if (!dbAvailable) return;
    const owner = await registerUser('Invalid Task');
    const project = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Validation Project' });

    const response = await request(app)
      .post(`/api/projects/${project.body.id}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'x', status: 'ARCHIVED' });

    expect(response.status).toBe(400);
  });

  it('prevents duplicate project membership', async () => {
    if (!dbAvailable) return;
    const owner = await registerUser('Member Owner');
    const member = await registerUser('Member User');

    const project = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Membership Project' });

    const first = await request(app)
      .post(`/api/projects/${project.body.id}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: member.email });
    expect(first.status).toBe(201);

    const duplicate = await request(app)
      .post(`/api/projects/${project.body.id}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: member.email });
    expect(duplicate.status).toBe(409);
  });
});
