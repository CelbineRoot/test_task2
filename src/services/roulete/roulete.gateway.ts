import {Server, Socket} from "socket.io";
import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit} from "@nestjs/websockets";
import {RouleteService} from "./roulete.service";
import {CreateBetDto} from "../bets/dto";
import {SUB_EVENTS} from "../../constants";
import {BetsService} from "../bets/bets.service";
import {forwardRef, Inject} from "@nestjs/common";

@WebSocketGateway()
export class RouleteGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(forwardRef(() => BetsService))
        private betsService: BetsService
    ) {}

    @SubscribeMessage(SUB_EVENTS.ADD_BET)
    async handleEvent(
        @MessageBody() data: CreateBetDto,
        @ConnectedSocket() _: Socket,
    ) {
        await this.betsService.bet({
            userId: data.userId,
            amount: data.amount
        });
        return "OK";
    }

    handleConnection(client: any) {
        console.log(`connected... id: ${client.id}`);
        client.id = `id-${Date.now()}`;
        this.server.emit('events', 'hello?');
        this.server.emit(JSON.stringify({ event: 'events', data: 'server-emit-stringify-test' }));
        client.emit({ event: 'events', data: 'client-emit-test' });
        client.emit(JSON.stringify({ event: 'events', data: 'client-emit-stringify-test' }));
        return { event: 'events', data: 'returned-data' };
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`);
        return 'OK'
    }

    // Метод для отправки события клиентам через WebSocket
    sendEventToClients(event: string, data: any) {
        this.server.emit(event, data);
    }
}