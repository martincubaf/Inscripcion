import { createServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { handle } from "./service.mjs";
import { existsSync } from "node:fs";
if (existsSync(".env")) process.loadEnvFile(".env");
const vite = await createViteServer({ server: { middlewareMode: true } });
createServer(async (req, res) => {
  if (req.url?.split("?")[0] !== "/api/registration")
    return vite.middlewares(req, res);
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 12000) {
        res.writeHead(413);
        res.end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request("http://localhost:5173/api/registration", {
      method: req.method,
      headers: req.headers,
      ...(req.method !== "GET" && req.method !== "HEAD"
        ? { body: Buffer.concat(chunks) }
        : {}),
    });
    const response = await handle(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch {
    res.writeHead(500);
    res.end("Error del servidor");
  }
}).listen(5173, "127.0.0.1", () => console.log("Local: http://localhost:5173"));
