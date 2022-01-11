import { serve } from "https://deno.land/std@0.120.0/http/server.ts";

serve(handler, { port: 8088 });

console.log("listen on 8088");

async function handler(req: Request): Promise<Response> {

  if (req.body) {
    const body = await req.json();
    if (body.post_type === "message") {
      console.log("Body:", body.message);
    }
  }

  return new Response(JSON.stringify({"reply":"hello"}));
}