import { serve } from "https://deno.land/std@0.120.0/http/server.ts";
import { qq } from './qq.ts'

serve(handler, { port: 8088 });

console.log("listen on 8088");

/// <reference types="./qq.d.ts" />

async function handler(req: Request): Promise<Response> {

  if (req.body) {
    // 处理qq消息
    const body: qqMessage = await req.json();
    if (body.post_type === "message") {
      console.log("Body:", body.message);
      const sendMsg = qq(body);
      return new Response(JSON.stringify({"reply": sendMsg}));
    }
  }
  return new Response("not message");
}