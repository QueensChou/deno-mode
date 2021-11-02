import { Roll } from './roll.ts';
import { Dnd } from './dnd.ts';
import { Coc } from './coc.ts';
import { Qmz } from './qmz.ts';
import { Cmz } from './cmz.ts';

const roll = new Roll();
const dnd = new Dnd();
const coc = new Coc();
const qmz = new Qmz();
const cmz = new Cmz();

const cmd = [roll, dnd, coc, qmz, cmz];

// 接收roll点指令
function sentMsg(key:string){
  for (const item of cmd) {
    if (item.isCmd(key)) {
      if ('isParam' in item) {
        return item.isParam(key);
      } else {
        return item.runCmd()
      }
    }
  }
  return null;
}

const sever = Deno.listen({port:8088});
console.log("listen on 8088!");

async function handle(conn:Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    await requestEvent.respondWith(await handleReq(requestEvent.request));
  }
}

async function fetchtext(req: Request) {
  const data = req.text();
  console.log(await data);
  return new Response(sentMsg(await data), {status: 200, headers:{"Access-Control-Allow-Origin": "http://127.0.0.1:8081"}});
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