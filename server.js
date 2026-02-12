const args = Bun.argv.slice(2);

// Mode detection: Default to Prod, unless --dev is present
const isDev = args.includes("--dev");
const isProd = !isDev;
const rootDir = isProd ? "dist" : "src";

// Parse port from arguments: --port 8000 or -p 8000
const portIndex = args.findIndex(arg => arg === "--port" || arg === "-p");
const argPort = portIndex !== -1 ? parseInt(args[portIndex + 1]) : null;

// Fallback logic: Argument > Env > Default (8000 for prod, 3000 for dev)
const PORT = argPort || (isProd ? process.env.PORT : process.env.DEV_PORT) || (isProd ? 8000 : 3000);

const COUCHDB_URL = process.env.COUCHDB_URL;
const COUCHDB_USER = process.env.COUCHDB_USER;
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD;
const COUCHDB_AUTH = Buffer.from(`${COUCHDB_USER}:${COUCHDB_PASSWORD}`).toString("base64");

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  idleTimeout: 254, 
  async fetch(req) {
    try {
      const url = new URL(req.url);
      let path = url.pathname;

      if (path === "/favicon.ico") return new Response(null, { status: 204 });

      // CouchDB Proxy
      if (path.startsWith("/db-proxy")) {
        const proxyPath = path.replace("/db-proxy", "");
        const targetUrl = `${COUCHDB_URL}${proxyPath}${url.search}`;
        const headers = new Headers(req.headers);
        headers.set("Authorization", `Basic ${COUCHDB_AUTH}`);
        headers.delete("host");
        headers.delete("connection");
        headers.delete("content-length");
        headers.delete("accept-encoding");

        const fetchOptions = { method: req.method, headers, redirect: "follow" };
        if (req.method !== "GET" && req.method !== "HEAD") fetchOptions.body = req.body;

        const proxiedResponse = await fetch(targetUrl, fetchOptions);
        const responseHeaders = new Headers(proxiedResponse.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("transfer-encoding");
        responseHeaders.delete("content-length");
        
        return new Response(proxiedResponse.body, {
          status: proxiedResponse.status,
          statusText: proxiedResponse.statusText,
          headers: responseHeaders,
        });
      }

      if (path === "/") path = "/index.html";
      const file = Bun.file(`${rootDir}${path}`);
      
      if (await file.exists()) {
        const responseHeaders = new Headers();
        if (path !== "/icon.svg" || req.headers.get('referer')) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);
        }
        if (path.endsWith(".svg") || path.endsWith(".json") || path.endsWith(".js")) {
          responseHeaders.set("Cache-Control", "public, max-age=3600");
        }
        return new Response(file, { headers: responseHeaders });
      }

      return new Response("Not found", { status: 404 });
    } catch (err) {
      console.error("Fetch error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port} (${isProd ? "PROD" : "DEV"} mode) serving from ./${rootDir}`);