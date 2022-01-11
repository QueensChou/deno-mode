import { serve } from "https://deno.land/std@0.120.0/http/server.ts";

serve(handler, { port: 8008 });

console.log("listen on 8008");

function handler(req: Request): Response {
  const _upgrade = req.headers.get("upgrade") || "";
  let socket: WebSocket, response;
  try {
    const res = Deno.upgradeWebSocket(req);
    socket = res.socket;
    response = res.response;
  } catch {
    return new Response("request isn't trying to upgrade to websocket.");
  }
  socket.onopen = () => console.log("socket opened");
  socket.onmessage = (e) => {
    console.log("socket message:", e.data);
    const data = JSON.parse(e.data);
    if(data.post_type === 'message') {
      const sendData = {
        "action": "send_group_msg",
        "params": {
            "group_id": data.group_id,
            "message": "你好"
        },
        "echo": "123"
    }
      console.log(sendData);
      socket.send(JSON.stringify(sendData));
      // socket.send(`send_msg?group_id=${data.group_id}&message=hello`);
    }
  };
  socket.onerror = (e) => console.log("socket errored:", e);
  socket.onclose = () => console.log("socket closed");
  return response;
}