import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UserDTO} from '../dto/UserDTO';
import {InjectRepository} from '@nestjs/typeorm';
import {MoreThan, Repository} from 'typeorm';
import {User} from '../entity/user.entity';
import {compare, hash} from 'bcrypt';
import {LoginDTO} from '../dto/LoginDTO';
import {JwtService} from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import {v4 as uuidv4} from 'uuid';
import * as dotenv from 'dotenv';
import {randomBytes} from 'crypto';

dotenv.config();

@Injectable()
export class ConnectionService {
  constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      private jwtService: JwtService,
  ) {}

  async signup(user: UserDTO, res) {
    const hashedPassword = await hash(user.password, 10);

    const jwt = await this.jwtService.signAsync(
        { id: user.id },
        { secret: process.env.secret },
    );

    const emailVerificationToken = uuidv4();

    const newUser = this.userRepository.create({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      password: hashedPassword,
      emailVerificationToken,
      isEmailVerified: false,
    });

    await this.sendVerificationEmail(user.email, emailVerificationToken);

    res.cookie('jwt', jwt, { httpOnly: true });

    await this.userRepository.save(newUser);
  }

  async login(user: LoginDTO, res): Promise<any> {
    try {
      let userFind = await this.userRepository.findOneBy({ email: user.email });
      if (!userFind) {
        return {
          status: 404,
          success: false,
          message: 'Utilisateur non trouvé. Vérifiez votre email.',
        };
      }

      if (!userFind.isEmailVerified) {
        return {
          status: 401,
          success: false,
          message: 'Veuillez vérifier votre email avant de vous connecter.',
        };
      }

      const passwordValid = await compare(user.password, userFind.password);
      if (!passwordValid) {
        return {
          status: 401,
          success: false,
          message: 'Mot de passe incorrect.',
        };
      }
      userFind = await this.userRepository.findOne({
        where: { email: user.email },
        relations: ['roles'], // ← à adapter selon ton entité
      });

    console.log(userFind.roles.map(r => r.name))
      const jwt = await this.jwtService.signAsync(
          {
            id: userFind.id,
            roles: userFind.roles.map(r => r.name), // ← retourne ['admin', 'manager'] par exemple
          },
          { secret: process.env.secret }
      );


      res.cookie('jwt', jwt, { httpOnly: true });
      return {
        status: 200,
        success: true,
        id: userFind.id,
        email: userFind.email,
        nom: userFind.nom,
        prenom: userFind.prenom,
        jwt,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: 'Une erreur s\'est produite lors de la connexion.',
      };
    }
  }

  async update(id: number, userDTO: UserDTO) {
    await this.userRepository.update(id, {
      nom: userDTO.nom,
      prenom: userDTO.prenom,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de vérification invalide ou expiré.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;

    await this.userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email.');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpire = new Date();
    resetTokenExpire.setHours(resetTokenExpire.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;

    await this.userRepository.save(user);

    await this.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré.');
    }

    user.password = await hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await this.userRepository.save(user);
  }

  private createTransporter() {
    if (!process.env.MAIL2) {
      throw new Error('La variable MAIL2 n\'est pas définie.');
    }

    return nodemailer.createTransport({
      host: 'mail.krissclotilde.com',
      port: 465,
      secure: true,
      auth: {
        user: 'noreply_justerecipes@krissclotilde.com',
        pass: ""+process.env.MAIL2,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const transporter = this.createTransporter();

    const verificationUrl = `https://localhost:3004/connection/verify-email?token=${token}`;

    await transporter.sendMail({
      from: 'noreply_justerecipes@krissclotilde.com',
      to: email,
      subject: 'Vérification de votre email',
      text: `Veuillez vérifier votre email en cliquant sur le lien suivant : ${verificationUrl}`,
    });
  }

  async sendResetPasswordEmail(
      email: string,
      token: string,
  ): Promise<{ success: boolean; message: string }> {
    const transporter = this.createTransporter();

    const resetUrl = `https://gestiontaches.krissclotilde.com/reset-password?token=${token}`;

    await transporter.sendMail({
      from: 'noreply_justerecipes@krissclotilde.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Pour réinitialiser votre mot de passe, cliquez sur le lien suivant : ${resetUrl}\nCe lien est valable 1 heure.`,
    });

    return {
      success: true,
      message: 'Email de réinitialisation envoyé avec succès.',
    };
  }
}
