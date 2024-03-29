import * as signalR from '@microsoft/signalr';
import app from './initFirebase';
import { getAuth } from 'firebase/auth';

const URL = import.meta.env.VITE_HUB_BASE_PATH;

class Connector {
  private connection: signalR.HubConnection;
  public events: ({
    onMessageReceived,
    onCustomersUpdated,
    onDesksUpdated
  }: {
    onMessageReceived?: (username: string, message: string) => void;
    onCustomersUpdated?: () => void;
    onDesksUpdated?: () => void;
  }) => void;
  static instance: Connector;

  constructor() {
    const token = getAuth(app).currentUser?.getIdToken() || '';
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL, {
        // Includes token as a query parameter (NOT IN THE AUTHORIZATION HEADER!)
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();
    this.connection.start().catch((err) => console.log(err));
    this.events = ({ onMessageReceived, onCustomersUpdated, onDesksUpdated }) => {
      if (onMessageReceived) {
        this.connection.on('messageReceived', (username, message) => {
          onMessageReceived(username, message);
        });
      }
      if (onCustomersUpdated) {
        this.connection.on('customersUpdated', onCustomersUpdated);
      }
      if (onDesksUpdated) {
        this.connection.on('desksUpdated', onDesksUpdated);
      }
    };
  }

  public newMessage = (username: string, messages: string) => {
    this.connection
      .send('newMessage', username, messages)
      .then(() => console.log('sent'));
  };

  public static getInstance(): Connector {
    if (!Connector.instance) {
      Connector.instance = new Connector();
    }
    return Connector.instance;
  }
}

export default Connector.getInstance;
