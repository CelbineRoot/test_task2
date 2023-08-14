import { registerAs } from '@nestjs/config';
import { get } from 'env-var';

export const appConfig = registerAs('app', () => ({
  host: get('HOST').required().asString(),
  port: get('PORT').required().asInt().toString(),

  dbHost: get('DB_HOST').required().asString(),
  dbPort: get('DB_PORT').required().asInt().toString(),
  dbUsername: get('DB_USERNAME').required().asString(),
  dbPassword: get('DB_PASSWORD').required().asString(),
  dbName: get('DB_NAME').required().asString(),
}));
