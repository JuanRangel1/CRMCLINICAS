import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClinicsModule } from './clinics/clinics.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { LeadsModule } from './leads/leads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { RoomsModule } from './rooms/rooms.module';
import { ProceduresModule } from './procedures/procedures.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { BudgetsModule } from './budgets/budgets.module';
import { FinancialModule } from './financial/financial.module';
import { FollowUpsModule } from './followups/followups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { ReportsModule } from './reports/reports.module';
import { SatisfactionModule } from './satisfaction/satisfaction.module';
import { TasksModule } from './tasks/tasks.module';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    AuthModule,
    AdminModule,
    ClinicsModule,
    UsersModule,
    PatientsModule,
    LeadsModule,
    AppointmentsModule,
    ProfessionalsModule,
    RoomsModule,
    ProceduresModule,
    TreatmentsModule,
    BudgetsModule,
    FinancialModule,
    FollowUpsModule,
    NotificationsModule,
    DashboardModule,
    IntelligenceModule,
    ReportsModule,
    SatisfactionModule,
    TasksModule,
    SearchModule,
    PipelineModule,
  ],
})
export class AppModule {}
