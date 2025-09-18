import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileService } from './user-profile.service';
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    nom: 'Doe',
    prenom: 'John',
    password: 'hashedPassword',
    roles: [{ id: 2, name: 'user', permissions: [] }],
  };

  const mockAdmin = {
    id: 2,
    email: 'admin@example.com',
    nom: 'Admin',
    prenom: 'Super',
    password: 'hashedPassword',
    roles: [{ id: 1, name: 'admin', permissions: [] }],
  };

  const mockRole = {
    id: 1,
    name: 'manager',
    permissions: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile with roles and permissions', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.getUserProfile(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles', 'roles.permissions'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserProfile(999))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles successfully', async () => {
      const targetUser = { ...mockUser, roles: [] };
      const updatedUser = { ...targetUser, roles: [mockRole] };
      const roleIds = [1];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(targetUser as User);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([mockRole] as Role[]);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as User);

      const result = await service.updateUserRoles(1, roleIds, mockUser as User);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      });
      expect(roleRepository.find).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.roles).toEqual([mockRole]);
    });

    it('should allow admin to update their own roles', async () => {
      const adminUser = { ...mockAdmin };
      const roleIds = [2];
      const newRole = { id: 2, name: 'user', permissions: [] };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(adminUser as User);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([newRole] as Role[]);
      jest.spyOn(userRepository, 'save').mockResolvedValue(adminUser as User);

      const result = await service.updateUserRoles(2, roleIds, mockAdmin as User);

      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when trying to modify another admin', async () => {
      const anotherAdmin = { ...mockAdmin, id: 3 };
      const roleIds = [2];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(anotherAdmin as User);

      await expect(service.updateUserRoles(3, roleIds, mockAdmin as User))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUserRoles(999, [1], mockUser as User))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when roles not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([]);

      await expect(service.updateUserRoles(1, [999], mockUser as User))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllNonAdminUsers', () => {
    it('should return all non-admin users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 3, roles: [] }, // User without roles
        { ...mockUser, id: 4, roles: [{ id: 3, name: 'manager' }] },
      ];

      jest.spyOn(userRepository, 'find').mockResolvedValue(users as User[]);

      const result = await service.getAllNonAdminUsers();

      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ['roles', 'roles.permissions'],
      });
      expect(result).toHaveLength(3);
      expect(result.some(user => user.roles?.some(role => role.name === 'admin'))).toBe(false);
    });

    it('should exclude admin users from results', async () => {
      const users = [mockUser, mockAdmin];

      jest.spyOn(userRepository, 'find').mockResolvedValue(users as User[]);

      const result = await service.getAllNonAdminUsers();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUser.id);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = { nom: 'NewName', prenom: 'NewFirstName' };
      const updatedUser = { ...mockUser, ...updateData };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as User);

      const result = await service.updateProfile(1, updateData);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateData)
      );
      expect(result.nom).toBe(updateData.nom);
      expect(result.prenom).toBe(updateData.prenom);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.updateProfile(999, { nom: 'NewName' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      const updateData = { nom: 'NewName' };
      const updatedUser = { ...mockUser, nom: 'NewName' };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as User);

      const result = await service.updateProfile(1, updateData);

      expect(result.nom).toBe(updateData.nom);
      expect(result.prenom).toBe(mockUser.prenom); // Should remain unchanged
    });
  });
});
