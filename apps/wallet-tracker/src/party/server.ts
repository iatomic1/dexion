import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected: id: ${conn.id} room: ${this.room.id} url: ${
        new URL(ctx.request.url).pathname
      }`,
    );
  }

  async onMessage(message: string) {
    this.room.broadcast(message, []);
  }

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const body = await req.text();
      this.room.broadcast(body);
      return new Response("Message broadcasted", { status: 200 });
    }

    return new Response("Unsupported method", { status: 405 });
  }
}
