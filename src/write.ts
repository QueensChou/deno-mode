export function writeJson(path: string, data: Record<string, unknown>):void {
  try {
    Deno.writeTextFileSync(path, JSON.stringify(data));

    console.log("Written to " + path); 
  } catch (e) {
    console.log(e.message); 
  }
}