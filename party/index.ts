import type * as Party from "partykit/server";

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) {
        console.log(room.id);
    }

    private videoTitlequeue: {
        name: string;
        id: string;
    }[] = [
        {
            name: "name",
            id: "id"
        }
    ];

    async onStart() {
        console.log("start");
    }

    async onConnect(
        connection: Party.Connection,
        ctx: Party.ConnectionContext
    ) {
        this.room.broadcast(connection.id + " has connected");
        connection.send("Current queue is " + this.videoTitlequeue.toString());
    }

    async onClose(connection: Party.Connection) {
        console.log("connection closed");
    }

    async onError(connection: Party.Connection, error: Error) {
        console.log(error);
    }

    onMessage(message: string, sender: Party.Connection) {
        // send the message to all connected clients
        this.room.broadcast(`${sender.id} searched for ${message}`);
    }
}
