import type { PartyKitServer } from "partykit/server";

export default {
    async onConnect(ws, room) {
        // A websocket just connected!
        console.log(
            `Connected:
            id: ${ws.id}
            room: ${room.id}`
        );

        // let's send a message to the connection
        ws.send("hello from server");
    },
    onMessage(message, ws, room) {
        console.log(`connection ${ws.id} sent message: ${message}`);
        room.broadcast(
            `${ws.id}: ${message}`,
            // ...except for the connection it came from
            [ws.id]
        );
    }
} satisfies PartyKitServer;
