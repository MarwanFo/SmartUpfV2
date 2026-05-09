import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as Joi from 'joi';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { CoursesModule } from './modules/courses/courses.module';
import { GradesModule } from './modules/grades/grades.module';
import { AbsencesModule } from './modules/absences/absences.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { AcademicModulesModule } from './modules/academic-modules/academic-modules.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AiModule } from './modules/ai/ai.module';
import { VrModule } from './modules/vr/vr.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { ClassesModule } from './modules/classes/classes.module';
import { UploadModule } from './modules/upload/upload.module';
import { ProfessorScheduleModule } from './modules/professor-schedule/professor-schedule.module';
import { QcmModule } from './modules/qcm/qcm.module';
import { StudentModule } from './modules/student/student.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import geminiConfig from './config/gemini.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, geminiConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().required(),
        API_PREFIX: Joi.string().default('api'),
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        NVIDIA_API_KEY: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    BuildingsModule,
    CoursesModule,
    GradesModule,
    AbsencesModule,
    TimetableModule,
    IncidentsModule,
    AnalyticsModule,
    NotificationsModule,
    AuditModule,
    AiModule,
    VrModule,
    ProgramsModule,
    AcademicModulesModule,
    ProfessorModule,
    FacultiesModule,
    ClassesModule,
    UploadModule,
    ProfessorScheduleModule,
    QcmModule,
    StudentModule,
  ],
})
export class AppModule {}
