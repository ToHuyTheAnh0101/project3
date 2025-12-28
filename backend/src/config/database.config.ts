import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

export const DatabaseModule = [
  ConfigModule.forRoot({
    isGlobal: true, // để toàn bộ app có thể đọc .env
  }),
  MongooseModule.forRoot(process.env.MONGO_URI),
];
