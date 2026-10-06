import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CRM Clínicas E2E', () => {
  let app: INestApplication;
  let tokenA: string;
  let tokenB: string;
  let patientBId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const a = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin.clinica1@exemplo.com', password: 'Senha@123' });
    tokenA = a.body.accessToken;
    const b = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin.clinica2@exemplo.com', password: 'Senha@123' });
    tokenB = b.body.accessToken;

    const patientsB = await request(app.getHttpServer()).get('/patients').set('Authorization', `Bearer ${tokenB}`);
    patientBId = patientsB.body[0].id;
  });

  afterAll(async () => { await app.close(); });

  it('login retorna tokens', () => {
    expect(tokenA).toBeTruthy();
    expect(tokenB).toBeTruthy();
  });

  it('login inválido é rejeitado', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin.clinica1@exemplo.com', password: 'errada' });
    expect(res.status).toBe(401);
  });

  it('multi-tenancy: clínica A não acessa paciente da clínica B', async () => {
    const res = await request(app.getHttpServer()).get(`/patients/${patientBId}`).set('Authorization', `Bearer ${tokenA}`);
    expect([403, 404]).toContain(res.status);
  });

  it('multi-tenancy: listagens são isoladas por clínica', async () => {
    const a = await request(app.getHttpServer()).get('/patients').set('Authorization', `Bearer ${tokenA}`);
    const b = await request(app.getHttpServer()).get('/patients').set('Authorization', `Bearer ${tokenB}`);
    expect(a.body.length).toBeGreaterThan(0);
    expect(b.body.length).toBeGreaterThan(0);
    const idsA = new Set(a.body.map((p: any) => p.id));
    for (const p of b.body) expect(idsA.has(p.id)).toBe(false);
  });

  it('RBAC: recepcionista não pode suspender clínica', async () => {
    const r = await request(app.getHttpServer()).post('/auth/login').send({ email: 'recepcao1.1@exemplo.com', password: 'Senha@123' });
    const res = await request(app.getHttpServer()).post('/clinics/any/suspend').set('Authorization', `Bearer ${r.body.accessToken}`).send({ status: 'SUSPENDED' });
    expect(res.status).toBe(403);
  });

  it('CRUD de pacientes funciona', async () => {
    const created = await request(app.getHttpServer()).post('/patients').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Paciente Teste E2E' });
    expect(created.status).toBe(201);
    const id = created.body.id;
    const updated = await request(app.getHttpServer()).put(`/patients/${id}`).set('Authorization', `Bearer ${tokenA}`).send({ name: 'Paciente Teste E2E 2' });
    expect(updated.body.name).toBe('Paciente Teste E2E 2');
    const del = await request(app.getHttpServer()).delete(`/patients/${id}`).set('Authorization', `Bearer ${tokenA}`);
    expect(del.body.ok).toBe(true);
  });

  it('agendamento conflita em mesma sala', async () => {
    const rooms = await request(app.getHttpServer()).get('/rooms').set('Authorization', `Bearer ${tokenA}`);
    const roomId = rooms.body[0].id;
    const patients = await request(app.getHttpServer()).get('/patients').set('Authorization', `Bearer ${tokenA}`);
    const prof = await request(app.getHttpServer()).get('/professionals').set('Authorization', `Bearer ${tokenA}`);
    const payload = {
      startAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      endAt: new Date(Date.now() + 365 * 86400000 + 3600000).toISOString(),
      patientId: patients.body[0].id,
      professionalId: prof.body[0].id,
      roomId,
    };
    const first = await request(app.getHttpServer()).post('/appointments').set('Authorization', `Bearer ${tokenA}`).send(payload);
    expect([201, 409]).toContain(first.status);
    if (first.status === 201) {
      const second = await request(app.getHttpServer()).post('/appointments').set('Authorization', `Bearer ${tokenA}`).send({ ...payload, professionalId: prof.body[1].id });
      expect(second.status).toBe(409);
    }
  });
});
