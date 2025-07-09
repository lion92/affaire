import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {JwtStrategy} from "../jwt.strategy";


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret', // 🔐 .env
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ConnectionController],
  providers: [ConnectionService, JwtStrategy],
  exports: [JwtModule, PassportModule], // utile si d'autres modules ont besoin
})
export class ConnectionModule {}
