import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConnectionModule} from './connection/connection.module';
import {JwtModule} from '@nestjs/jwt';
import {MulterModule} from '@nestjs/platform-express';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {DealModule} from './deal/deal.module';
import {CategoryModule} from './category/category.module';
import {RoleModule} from './role/role.module';
import {PermissionModule} from './permission/permission.module';
import * as dotenv from 'dotenv';
import {UserProfileModule} from "./user-profile/user-profile.module";
import {LikeModule} from './like/like.module';

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),

        MulterModule.register({
            dest: './uploads',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: '',
                database: 'affaire',
                entities: ['dist/**/*.entity.js'],
                synchronize: true,
            }),
        }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {expiresIn: '1d'},
            }),
        }),

        ConnectionModule,
        DealModule,
        CategoryModule,
        RoleModule,
        PermissionModule,
        UserProfileModule,
        LikeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
