import type * as Party from "partykit/server";

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) {}

    async onStart() {
        console.log("start");
    }

    async onConnect(
        connection: Party.Connection,
        ctx: Party.ConnectionContext
    ) {
        console.log("connection whaa happened");
    }

    async onClose(connection: Party.Connection) {
        console.log("connection whaaa closed");
    }

    async onError(connection: Party.Connection, error: Error) {
        console.log(error);
    }
}
