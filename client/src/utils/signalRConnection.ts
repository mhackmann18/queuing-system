import * as signalR from '@microsoft/signalr';

const URL = 'http://localhost:5274/hub'; //or whatever your backend port is

class Connector {
  private connection: signalR.HubConnection;
  public events: ({
    onMessageReceived,
    onCustomersUpdated
  }: {
    onMessageReceived?: (username: string, message: string) => void;
    onCustomersUpdated?: () => void;
  }) => void;
  static instance: Connector;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(URL)
      .withAutomaticReconnect()
      .build();
    this.connection.start().catch((err) => console.log(err));
    this.events = ({ onMessageReceived, onCustomersUpdated }) => {
      if (onMessageReceived) {
        this.connection.on('messageReceived', (username, message) => {
          onMessageReceived(username, message);
        });
      }
      if (onCustomersUpdated) {
        this.connection.on('customersUpdated', onCustomersUpdated);
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
