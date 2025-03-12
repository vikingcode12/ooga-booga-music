import type * as Party from "partykit/server";

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) {
        console.log(room.id);
    }

    async onStart() {
        console.log("start");
    }

    async onConnect(
        connection: Party.Connection,
        ctx: Party.ConnectionContext
    ) {
        this.room.broadcast(JSON.stringify(connection.id + " has connected"));
    }

    async onClose(connection: Party.Connection) {
        console.log("connection closed");
    }

    async onError(connection: Party.Connection, error: Error) {
        console.log(error);
    }

    onMessage(message: string, sender: Party.Connection) {
        // send the message to all connected clients
        const data = JSON.parse(message);
        this.room.broadcast(JSON.stringify(data));
    }
}
