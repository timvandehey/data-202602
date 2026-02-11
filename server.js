const args = Bun.argv.slice(2);
const devArg = args.includes("--dev");
const isDev = devArg || process.env.NODE_ENV === "development" || process.env.DEV_MODE === "true";
const rootDir = isDev ? "src" : "dist";

const server = Bun.serve({
  port: 8000,
  hostname: "0.0.0.0",
  async fetch(req) {
    try {
      const url = new URL(req.url);
      let path = url.pathname;
      if (path === "/") path = "/index.html";

      console.log(`${req.method} ${path}`);

      const file = Bun.file(`${rootDir}${path}`);
      const exists = await file.exists();
      if (exists) {
        if (path === "/index.html") {
          let content = await file.text();
          console.log(`Injecting DEV_MODE into index.html (isDev: ${isDev})`);
          
          // Inject DEV_MODE variable
          content = content.replace(
            "<head>",
            `<head><script>window.DEV_MODE = ${isDev};</script>`
          );

          // If not dev, remove PWA bits
          if (!isDev) {
            content = content.replace(/<link rel="manifest" href="manifest.json">/, "");
            content = content.replace(/<meta name="theme-color" content="#000000"\/>/, "");
            content = content.replace(/Juris Counter PWA/g, "Juris Counter");
            content = content.replace(/Juris\.js Counter PWA/g, "Juris.js Counter");
          }

          return new Response(content, {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      console.error("Fetch error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port} (${isDev ? "DEV mode" : "PROD mode"}) serving from ./${rootDir}`);