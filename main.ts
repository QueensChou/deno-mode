import { rollSent } from './roll.ts'

const sever = Deno.listen({port:8088});
console.log("listen on 8088!");

async function handle(conn:Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    await requestEvent.respondWith(await handleReq(requestEvent.request));
  }
}

async function fetchtext(req: Request) {
  return new Response(rollSent(await req.text()), {status: 200, headers:{"Access-Control-Allow-Origin": "http://127.0.0.1:8081"}});
}

async function handleReq(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
      return await fetchtext(req);
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => console.log("socket opened");
  socket.onmessage = (e) => {
    console.log("socket message:", e.data);
    socket.send("hello, Socket request!");
  };
  socket.onerror = (e) => console.log("socket errored:", e);
  socket.onclose = () => console.log("socket closed");
  return response;
}

for await (const conn of sever) {
  handle(conn);
}