import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConnectionService } from './connection.service';
import { User } from '../entity/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock des modules externes
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe('ConnectionService', () => {
  let service: ConnectionService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    nom: 'Doe',
    prenom: 'John',
    password: 'hashedPassword',
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpire: null,
    roles: [{ id: 1, name: 'user' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Mock des variables d'environnement
    process.env.secret = 'test-secret';
    process.env.MAIL2 = 'test-mail-password';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and send verification email', async () => {
      const userDto = {
        id: 1,
        email: 'new@example.com',
        nom: 'Doe',
        prenom: 'Jane',
        password: 'password123',
        isEmailVerified: false,
      };

      const mockResponse = {
        cookie: jest.fn(),
      };

      const hashedPassword = 'hashedPassword123';
      const jwtToken = 'jwt-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwtToken);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...userDto,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationToken: expect.any(String),
      } as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as any);
      jest.spyOn(service as any, 'sendVerificationEmail').mockResolvedValue(undefined);

      await service.signup(userDto, mockResponse);

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id: userDto.id },
        { secret: process.env.secret }
      );
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', jwtToken, { httpOnly: true });
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
        isEmailVerified: true,
      };

      const mockResponse = {
        cookie: jest.fn(),
      };

      const jwtToken = 'jwt-token';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwtToken);

      const result = await service.login(loginDto, mockResponse);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          roles: ['user'],
        },
        { secret: process.env.secret }
      );
      expect(result).toEqual({
        status: 200,
        success: true,
        id: mockUser.id,
        email: mockUser.email,
        nom: mockUser.nom,
        prenom: mockUser.prenom,
        jwt: jwtToken,
      });
    });

    it('should return 404 when user not found', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
        isEmailVerified: true,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.login(loginDto, {});

      expect(result).toEqual({
        status: 404,
        success: false,
        message: 'Utilisateur non trouvé. Vérifiez votre email.',
      });
    });

    it('should return 401 when email not verified', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
        isEmailVerified: false,
      };

      const unverifiedUser = { ...mockUser, isEmailVerified: false };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(unverifiedUser as User);

      const result = await service.login(loginDto, {});

      expect(result).toEqual({
        status: 401,
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter.',
      });
    });

    it('should return 401 when password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
        isEmailVerified: true,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto, {});

      expect(result).toEqual({
        status: 401,
        success: false,
        message: 'Mot de passe incorrect.',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-token';
      const userWithToken = {
        ...mockUser,
        isEmailVerified: false,
        emailVerificationToken: token,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithToken as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as any);

      await service.verifyEmail(token);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { emailVerificationToken: token },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...userWithToken,
        isEmailVerified: true,
        emailVerificationToken: null,
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.verifyEmail(token))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const email = 'test@example.com';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as any);
      jest.spyOn(service as any, 'sendResetPasswordEmail').mockResolvedValue(undefined);

      // Mock crypto.randomBytes
      const crypto = require('crypto');
      const mockRandomBytes = jest.spyOn(crypto, 'randomBytes').mockReturnValue({
        toString: jest.fn().mockReturnValue('reset-token'),
      });

      await service.forgotPassword(email);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existing user', async () => {
      const email = 'notfound@example.com';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.forgotPassword(email))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newPassword123';
      const hashedNewPassword = 'hashedNewPassword123';

      const userWithResetToken = {
        ...mockUser,
        resetPasswordToken: token,
        resetPasswordExpire: new Date(Date.now() + 3600000), // 1 hour from now
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithResetToken as User);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as any);

      await service.resetPassword(token, newPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: token,
          resetPasswordExpire: MoreThan(expect.any(Date)),
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...userWithResetToken,
        password: hashedNewPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      });
    });

    it('should throw BadRequestException for invalid or expired token', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword123';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const userId = 1;
      const updateDto = {
        nom: 'UpdatedNom',
        prenom: 'UpdatedPrenom',
      };

      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);

      await service.update(userId, updateDto as any);

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        nom: updateDto.nom,
        prenom: updateDto.prenom,
      });
    });
  });
});