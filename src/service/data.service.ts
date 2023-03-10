import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Message} from '../types/message';



@Injectable({
  providedIn: 'root'
})
export class DataService {

  private socket$!: WebSocketSubject<any>;

  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param cfg if true the observable will be retried.
   */
  public connect(): void {

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();

      this.socket$.subscribe(
        // Called whenever there is a message from the server
        msg => {
          console.log('Received message of type: ' + msg.type);
          this.messagesSubject.next(msg);
        }
      );
    }
  }

  sendMessage(msg: Message): void {
    console.log('sending message: ' + msg.type);
    this.socket$.next(msg);
  }

  /**
   * Return a custom WebSocket subject which reconnects after failure
   */
  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      // url: 'ws://localhost:8080/socket',
      url: 'ws://192.168.1.51:8080/socket',
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          // @ts-ignore
          this.socket$ = undefined;
          this.connect();
        }
      }
    });
  }
}
