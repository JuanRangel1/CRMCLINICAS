import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Senha@123', 10);

  const roles = ['SUPER_ADMIN', 'ADMIN_CLINIC', 'MANAGER', 'RECEPTIONIST', 'PROFESSIONAL', 'FINANCIAL', 'MARKETING'] as const;
  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const role = await prisma.role.upsert({ where: { name: r }, update: {}, create: { name: r, description: r } });
    roleMap[r] = role.id;
  }

  const plans = [
    { code: 'FREE', name: 'Free', maxUsers: 3, maxProfessionals: 2, maxPatients: 100, maxLeads: 50, storageMb: 100, hasReports: false, hasIntelligence: false },
    { code: 'STARTER', name: 'Starter', maxUsers: 10, maxProfessionals: 5, maxPatients: 1000, maxLeads: 500, storageMb: 1024, hasReports: true, hasIntelligence: false },
    { code: 'PRO', name: 'Pro', maxUsers: 25, maxProfessionals: 15, maxPatients: 5000, maxLeads: 2000, storageMb: 5120, hasReports: true, hasIntelligence: true },
    { code: 'ENTERPRISE', name: 'Enterprise', maxUsers: 100, maxProfessionals: 50, maxPatients: 50000, maxLeads: 20000, storageMb: 20480, hasReports: true, hasIntelligence: true },
  ] as const;
  for (const p of plans) {
    await prisma.plan.upsert({ where: { code: p.code }, update: {}, create: p as any });
  }

  const specialties = ['Medicina', 'Odontologia', 'Psicologia', 'Fisioterapia', 'Nutrição', 'Dermatologia', 'Estética'];
  const specialtyId: Record<string, string> = {};
  for (const s of specialties) {
    const sp = await prisma.specialty.upsert({ where: { name: s }, update: {}, create: { name: s } });
    specialtyId[s] = sp.id;
  }

  const sources = ['Instagram', 'Facebook', 'Google', 'WhatsApp', 'Site', 'Indicação', 'Telefone', 'Campanha', 'Evento', 'Tráfego pago', 'Manual'];
  const sourceId: Record<string, string> = {};
  for (const s of sources) {
    const src = await prisma.leadSource.upsert({ where: { name: s }, update: {}, create: { name: s } });
    sourceId[s] = src.id;
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@crmclinicas.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@crmclinicas.com', passwordHash: hash, roleId: roleMap['SUPER_ADMIN'], active: true },
  });
  console.log('SuperAdmin:', superAdmin.email);

  const clinicNames = ['Clínica Saúde Total', 'Odonto Prime', 'Vita Psicologia'];
  for (let c = 0; c < 3; c++) {
    const plan = await prisma.plan.findFirst({ where: { code: c === 0 ? 'PRO' : c === 1 ? 'STARTER' : 'FREE' } });
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicNames[c],
        email: `clinica${c + 1}@exemplo.com`,
        phone: `(11) 4000-000${c + 1}`,
        whatsapp: `(11) 90000-000${c + 1}`,
        city: 'São Paulo',
        state: 'SP',
        status: 'ACTIVE',
        planId: plan?.id,
      },
    });
    await prisma.subscription.create({ data: { clinicId: clinic.id, planId: plan!.id, status: 'ACTIVE' } });

    const adminUser = await prisma.user.create({ data: { name: `Admin ${clinic.name}`, email: `admin.clinica${c + 1}@exemplo.com`, passwordHash: hash, roleId: roleMap['ADMIN_CLINIC'], clinicId: clinic.id } });

    const managers: any[] = [];
    for (let m = 0; m < 2; m++) {
      managers.push(await prisma.user.create({ data: { name: `Gerente ${m + 1}`, email: `gerente${c + 1}.${m + 1}@exemplo.com`, passwordHash: hash, roleId: roleMap['MANAGER'], clinicId: clinic.id } }));
    }
    for (let r = 0; r < 3; r++) {
      await prisma.user.create({ data: { name: `Recepção ${r + 1}`, email: `recepcao${c + 1}.${r + 1}@exemplo.com`, passwordHash: hash, roleId: roleMap['RECEPTIONIST'], clinicId: clinic.id } });
    }

    const professionals: any[] = [];
    for (let p = 0; p < 5; p++) {
      const spec = specialties[(c + p) % specialties.length];
      const prof = await prisma.professional.create({
        data: {
          name: `Profissional ${c + 1}.${p + 1}`,
          email: `prof${c + 1}.${p + 1}@exemplo.com`,
          council: 'CRM',
          registryNumber: `${1000 + c * 10 + p}`,
          clinicId: clinic.id,
          specialtyId: specialtyId[spec],
        },
      });
      professionals.push(prof);
    }

    const rooms: any[] = [];
    for (let r = 0; r < 3; r++) {
      rooms.push(await prisma.room.create({ data: { name: `Sala 0${r + 1}`, clinicId: clinic.id } }));
    }

    const procedureNames = ['Consulta', 'Avaliação', 'Limpeza', 'Clareamento', 'Botox', 'Fisioterapia', 'Exame', 'Retorno'];
    const procedures: any[] = [];
    for (const pn of procedureNames) {
      procedures.push(await prisma.procedure.create({ data: { name: pn, category: 'Geral', durationMin: 30 + (procedures.length % 4) * 15, price: 100 + procedures.length * 80, commission: 10, clinicId: clinic.id } }));
    }

    const patients: any[] = [];
    for (let i = 0; i < 50; i++) {
      patients.push(await prisma.patient.create({ data: { name: `Paciente ${c + 1}-${i + 1}`, email: `paciente${c + 1}.${i + 1}@exemplo.com`, phone: `(11) 90000-${String(1000 + i).slice(1)}`, clinicId: clinic.id } }));
    }

    const leads: any[] = [];
    for (let i = 0; i < 30; i++) {
      leads.push(await prisma.lead.create({
        data: {
          name: `Lead ${c + 1}-${i + 1}`,
          email: `lead${c + 1}.${i + 1}@exemplo.com`,
          phone: `(11) 91000-${String(1000 + i).slice(1)}`,
          status: (['NEW', 'FIRST_CONTACT', 'QUALIFIED', 'SCHEDULING', 'ATTENDED', 'BUDGET', 'CONVERTED', 'LOST'] as const)[i % 8],
          score: Math.min(100, (i * 7) % 101),
          clinicId: clinic.id,
          sourceId: sourceId[sources[i % sources.length]],
          ownerId: adminUser.id,
        },
      }));
    }

    const pipeline = await prisma.pipeline.create({ data: { name: 'Comercial', clinicId: clinic.id } });
    const stageNames = ['NOVO LEAD', 'CONTATO', 'AVALIAÇÃO AGENDADA', 'AVALIAÇÃO REALIZADA', 'ORÇAMENTO ENVIADO', 'NEGOCIAÇÃO', 'TRATAMENTO INICIADO', 'TRATAMENTO CONCLUÍDO', 'PERDIDO'];
    const stages: any[] = [];
    for (let s = 0; s < stageNames.length; s++) {
      stages.push(await prisma.pipelineStage.create({ data: { name: stageNames[s], order: s, pipelineId: pipeline.id } }));
    }
    for (let i = 0; i < 20; i++) {
      const stage = stages[i % (stages.length - 1)];
      await prisma.opportunity.create({ data: { title: `Oportunidade ${i + 1}`, value: 300 + i * 150, stageId: stage.id, clinicId: clinic.id, leadId: leads[i % leads.length].id, patientId: patients[i % patients.length].id } });
    }

    for (let i = 0; i < 20; i++) {
      const start = new Date(Date.now() + i * 3600000 + 86400000);
      await prisma.appointment.create({
        data: {
          startAt: start,
          endAt: new Date(start.getTime() + 1800000),
          status: (['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELED'] as const)[i % 5],
          clinicId: clinic.id,
          patientId: patients[i % patients.length].id,
          professionalId: professionals[i % professionals.length].id,
          roomId: rooms[i % rooms.length].id,
          procedureId: procedures[i % procedures.length].id,
        },
      });
    }

    for (let i = 0; i < 15; i++) {
      await prisma.treatment.create({
        data: {
          name: `Tratamento ${i + 1}`,
          status: (['PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'] as const)[i % 4],
          startDate: new Date(),
          expectedEnd: new Date(Date.now() + 90 * 86400000),
          value: 500 + i * 200,
          clinicId: clinic.id,
          patientId: patients[i % patients.length].id,
          professionalId: professionals[i % professionals.length].id,
        },
      });
    }

    for (let i = 0; i < 20; i++) {
      const items = [{ description: procedures[i % procedures.length].name, quantity: 1, unitPrice: procedures[i % procedures.length].price, total: procedures[i % procedures.length].price, procedureId: procedures[i % procedures.length].id }];
      await prisma.budget.create({
        data: {
          total: items[0].total,
          status: (['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'] as const)[i % 5],
          validUntil: new Date(Date.now() + 15 * 86400000),
          clinicId: clinic.id,
          patientId: patients[i % patients.length].id,
          professionalId: professionals[i % professionals.length].id,
          items: { create: items },
        },
      });
    }

    for (let i = 0; i < 30; i++) {
      const isIncome = i % 3 !== 0;
      await prisma.transaction.create({
        data: {
          type: isIncome ? 'INCOME' : 'EXPENSE',
          category: isIncome ? 'Consultas' : ['Materiais', 'Aluguel', 'Marketing', 'Funcionários'][i % 4],
          amount: 150 + i * 60,
          status: isIncome ? 'PAID' : (['PAID', 'PENDING', 'OVERDUE'] as const)[i % 3],
          dueDate: new Date(Date.now() + i * 86400000),
          clinicId: clinic.id,
          patientId: isIncome ? patients[i % patients.length].id : undefined,
        },
      });
    }

    for (let i = 0; i < 10; i++) {
      await prisma.followUp.create({ data: { title: `Follow-up ${i + 1}`, dueDate: new Date(Date.now() + i * 86400000), clinicId: clinic.id, patientId: patients[i % patients.length].id } });
    }

    await prisma.notification.create({ data: { title: 'Novo lead recebido', clinicId: clinic.id } });
    await prisma.satisfactionSurvey.create({ data: { rating: 5, comment: 'Excelente atendimento', clinicId: clinic.id, patientId: patients[0].id, professionalId: professionals[0].id } });
  }

  console.log('Seed concluído');
}

main().finally(() => prisma.$disconnect());
