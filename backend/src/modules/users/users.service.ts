import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private generateRandomPassword(length = 12): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Génération d'un mot de passe robuste
    const plainPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const { studentProfile, professorProfile, parentProfile, ...userData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        studentProfile: studentProfile ? { create: studentProfile } : undefined,
        professorProfile: professorProfile ? { 
          create: (() => {
            const { departmentIds, programIds, moduleIds, facultyIds, buildingIds, ...profData } = professorProfile;
            return {
              ...profData,
              faculties: facultyIds ? { connect: facultyIds.map(id => ({ id })) } : undefined,
              buildings: buildingIds ? { connect: buildingIds.map(id => ({ id })) } : undefined,
              departments: departmentIds ? { connect: departmentIds.map(id => ({ id })) } : undefined,
              programs: programIds ? { connect: programIds.map(id => ({ id })) } : undefined,
              modules: moduleIds ? { connect: moduleIds.map(id => ({ id })) } : undefined
            };
          })()
        } : undefined,
        parentProfile: parentProfile ? { 
          create: (() => {
            const { childrenIds, ...parentData } = parentProfile;
            return {
              ...parentData,
              children: childrenIds ? {
                connect: childrenIds.map(id => ({ userId: id }))
              } : undefined
            };
          })()
        } : undefined,
      },
      include: {
        role: true,
        building: true,
        studentProfile: true,
        professorProfile: true,
        parentProfile: true,
      }
    });

    return {
      user,
      tempPassword: plainPassword
    };
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
        building: true,
        studentProfile: true,
        professorProfile: {
          include: {
            faculties: true,
            buildings: true,
            departments: true,
            programs: true,
            modules: true
          }
        },
        parentProfile: {
          include: {
            children: {
              include: { user: { select: { firstName: true, lastName: true, email: true } } }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        building: true,
        studentProfile: true,
        professorProfile: {
          include: {
            faculties: true,
            buildings: true,
            departments: true,
            programs: true,
            modules: true
          }
        },
        parentProfile: {
          include: {
            children: {
              include: { user: { select: { firstName: true, lastName: true, email: true } } }
            }
          }
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Vérifie si l'utilisateur existe

    const { studentProfile, professorProfile, parentProfile, ...userData } = updateUserDto;

    const updateData: any = { ...userData };

    if (studentProfile) {
      updateData.studentProfile = {
        upsert: { create: studentProfile, update: studentProfile }
      };
    }

    if (professorProfile) {
      const { facultyIds, buildingIds, departmentIds, programIds, moduleIds, ...profData } = professorProfile;
      console.log('[UsersService] Updating Professor Profile Relations:', { facultyIds, programIds, moduleIds });

      // Safety: Only connect IDs that actually exist to avoid P2025 (404)
      const [vFac, vBuild, vDept, vProg, vMod] = await Promise.all([
        facultyIds?.length ? this.prisma.faculty.findMany({ where: { id: { in: facultyIds } }, select: { id: true } }) : Promise.resolve([]),
        buildingIds?.length ? this.prisma.building.findMany({ where: { id: { in: buildingIds } }, select: { id: true } }) : Promise.resolve([]),
        departmentIds?.length ? this.prisma.department.findMany({ where: { id: { in: departmentIds } }, select: { id: true } }) : Promise.resolve([]),
        programIds?.length ? this.prisma.program.findMany({ where: { id: { in: programIds } }, select: { id: true } }) : Promise.resolve([]),
        moduleIds?.length ? this.prisma.module.findMany({ where: { id: { in: moduleIds } }, select: { id: true } }) : Promise.resolve([]),
      ]);

      const validFacIds = vFac.map(i => i.id);
      const validBuildIds = vBuild.map(i => i.id);
      const validDeptIds = vDept.map(i => i.id);
      const validProgIds = vProg.map(i => i.id);
      const validModIds = vMod.map(i => i.id);

      console.log('[UsersService] Validated IDs:', { validFacIds, validProgIds, validModIds });

      const connectRelations = {
        faculties: validFacIds.length ? { connect: validFacIds.map(id => ({ id })) } : undefined,
        buildings: validBuildIds.length ? { connect: validBuildIds.map(id => ({ id })) } : undefined,
        departments: validDeptIds.length ? { connect: validDeptIds.map(id => ({ id })) } : undefined,
        programs: validProgIds.length ? { connect: validProgIds.map(id => ({ id })) } : undefined,
        modules: validModIds.length ? { connect: validModIds.map(id => ({ id })) } : undefined,
      };

      // Important: Use 'set' only if IDs were explicitly provided to avoid accidental clearing
      const setRelations: any = {};
      if (facultyIds !== undefined) setRelations.faculties = { set: validFacIds.map(id => ({ id })) };
      if (buildingIds !== undefined) setRelations.buildings = { set: validBuildIds.map(id => ({ id })) };
      if (departmentIds !== undefined) setRelations.departments = { set: validDeptIds.map(id => ({ id })) };
      if (programIds !== undefined) setRelations.programs = { set: validProgIds.map(id => ({ id })) };
      if (moduleIds !== undefined) setRelations.modules = { set: validModIds.map(id => ({ id })) };

      updateData.professorProfile = {
        upsert: { 
          create: { ...profData, ...connectRelations }, 
          update: { ...profData, ...setRelations } 
        }
      };
    }

    if (parentProfile) {
      const { childrenIds, ...parentData } = parentProfile;
      updateData.parentProfile = {
        upsert: { 
          create: {
            ...parentData,
            children: childrenIds ? { connect: childrenIds.map(cId => ({ userId: cId })) } : undefined
          }, 
          update: {
            ...parentData,
            children: childrenIds ? { set: childrenIds.map(cId => ({ userId: cId })) } : undefined
          } 
        }
      };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        building: true,
        studentProfile: true,
        professorProfile: {
          include: {
            faculties: true,
            buildings: true,
            departments: true,
            programs: true,
            modules: true,
          }
        },
        parentProfile: true,
      }
    });

    return updated;
  }
  async resetPassword(id: string) {
    const user = await this.findOne(id);
    const plainPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Mot de passe réinitialisé avec succès',
      tempPassword: plainPassword
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
