import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect  {
  
    @WebSocketServer() websocketServer!: Server;

  constructor(private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {


  }
 async handleConnection(client: Socket) {
    const authorization = client.handshake.headers.authorization;
    const handshakeToken = client.handshake.auth?.token;
    const token = (handshakeToken || authorization || '').replace(/^Bearer\s+/i, '');
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
     await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({ payload });
    // console.log('Cliente conectado', client.id);

    this.websocketServer.emit('clients-updated', this.messageWsService.getConnectedClients());
  }
  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id);
    this.messageWsService.removeClient(client.id);
    this.websocketServer.emit('clients-updated', this.messageWsService.getConnectedClients());
  }
  // nessage-from-client
  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {

//! Emite unicamente al cliente
  //  client.emit('message-from-server',
  //    { fullName: 'Soy Yo', 
  //   message: payload.message || 'no-message'
  //  });

//! Emite a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server',
    //   { fullName: 'Soy Yo', 
    //  message: payload.message || 'no-message'
    // });

// EMITIR A TODOS
    this.websocketServer.to('clienteID')
    this.websocketServer.emit('message-from-server',
      { fullName: this.messageWsService.getUserFullName(client.id), 
     message: payload.message || 'no-message'
    });
  }
}
