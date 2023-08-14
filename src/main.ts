import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  AsyncApiDocumentBuilder,
  AsyncApiModule,
  AsyncServerObject,
} from 'nestjs-asyncapi';
import { AppModule } from './app.module';
import { appConfig } from './modules/config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.useLogger(['log', 'debug', 'error', 'verbose', 'warn']);

  const asyncApiServer: AsyncServerObject = {
    url: `ws://${config.host}`,
    protocol: 'socket.io',
    protocolVersion: '4',
    description:
      'Allows you to connect using the websocket protocol to our Socket.io server.',
    bindings: {},
  };

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Bets SocketIO')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('bets-server', asyncApiServer)
    .build();

  const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('/socket-documentation', app, asyncapiDocument);


  await app.init();
  await app.listen(config.port);
}
bootstrap();
