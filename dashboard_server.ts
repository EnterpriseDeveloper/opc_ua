import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { withIgnitionSession, writeBooleanTag } from "./ignition_connection";
import { readElectricityTags } from "./electricity_reader";
import { readMotorTags } from "./motor_reader";
import { readPumpTags } from "./pump_reader";

const host = process.env.DASHBOARD_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.DASHBOARD_PORT ?? "3010", 10);
const tagProvider = process.env.IGNITION_TAG_PROVIDER ?? "Sample_Tags";

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Factory OPC UA Dashboard</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; }
    body { margin: 0; background: #111827; color: #e5e7eb; }
    header { padding: 24px max(24px, calc((100vw - 1300px) / 2)); background: #0f172a; border-bottom: 1px solid #334155; }
    h1 { margin: 0; font-size: 1.5rem; } #updated { color: #94a3b8; font-size: .9rem; }
    main { max-width: 1300px; margin: 24px auto; padding: 0 24px; display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); }
    section { background: #1f2937; border: 1px solid #374151; border-radius: 10px; overflow: hidden; }
    h2 { margin: 0; padding: 14px 16px; font-size: 1.1rem; background: #273449; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; } th, td { padding: 9px 12px; text-align: left; border-top: 1px solid #374151; vertical-align: top; }
    th { color: #93c5fd; } td.path { overflow-wrap: anywhere; color: #cbd5e1; } td.value { font-weight: 600; color: #86efac; } td.status { color: #86efac; white-space: nowrap; }
    button { background: #2563eb; color: #fff; border: 0; border-radius: 5px; padding: 6px 10px; cursor: pointer; } button:hover { background: #1d4ed8; } button:disabled { background: #475569; cursor: wait; }
    .error { color: #fca5a5; padding: 20px; } .loading { color: #94a3b8; padding: 20px; }
  </style>
</head>
<body>
  <header><h1>Factory OPC UA Dashboard</h1><span id="updated">Connecting to Ignition…</span></header>
  <main id="dashboard"><p class="loading">Loading tags…</p></main>
  <script>
    const dashboard = document.getElementById('dashboard');
    const updated = document.getElementById('updated');
    const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
    function render(plcs) {
      dashboard.replaceChildren();
      Object.entries(plcs).forEach(([name, tags]) => {
        const section = document.createElement('section');
        section.innerHTML = '<h2>' + escapeHtml(name) + '</h2><table><thead><tr><th>Tag</th><th>Value</th><th>Status</th><th>NodeId</th><th>Control</th></tr></thead><tbody></tbody></table>';
        const body = section.querySelector('tbody');
        tags.forEach((tag) => {
          const row = document.createElement('tr');
          const tagName = tag.path.split('/').pop();
          row.innerHTML = '<td class="path">' + escapeHtml(tagName) + '</td><td class="value">' + escapeHtml(tag.value) + '</td><td class="status">' + escapeHtml(tag.status) + '</td><td class="path">' + escapeHtml(tag.nodeId) + '</td><td></td>';
          if (tag.path.includes('/Commands/') && ['Start', 'Stop', 'Reset'].includes(tagName)) {
            const button = document.createElement('button');
            const nextValue = tag.value !== 'true';
            button.textContent = nextValue ? 'Set true' : 'Set false';
            button.addEventListener('click', async () => {
              button.disabled = true;
              try {
                const response = await fetch('/api/tags/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nodeId: tag.nodeId, value: nextValue }) });
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error ?? 'Write failed');
                await refresh();
              } catch (error) {
                alert('Command failed: ' + error.message);
                button.disabled = false;
              }
            });
            row.lastElementChild.appendChild(button);
          }
          body.appendChild(row);
        });
        dashboard.appendChild(section);
      });
    }
    async function refresh() {
      try {
        const response = await fetch('/api/tags');
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? 'Request failed');
        render(payload.plcs);
        updated.textContent = 'Last read: ' + new Date(payload.readAt).toLocaleTimeString();
      } catch (error) {
        dashboard.innerHTML = '<p class="error">Unable to read Ignition tags: ' + escapeHtml(error.message) + '</p>';
        updated.textContent = 'Read failed';
      }
    }
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;

async function readAllTags() {
    return withIgnitionSession(async (session) => ({
        Motor: await readMotorTags(session, tagProvider),
        Pump: await readPumpTags(session, tagProvider),
        Electricity: await readElectricityTags(session, tagProvider)
    }));
}

function isAllowedCommandNode(nodeId: unknown): nodeId is string {
    if (typeof nodeId !== "string") return false;
    const escapedProvider = tagProvider.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(
        `^ns=\\d+;s=\\[${escapedProvider}\\]/(?:Motor|Pump)/Commands/(?:Start|Stop|Reset)$`
    ).test(nodeId);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > 10_000) throw new Error("Request body is too large");
        chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const path = request.url?.split("?")[0];
    if (request.method === "GET" && path === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(page);
        return;
    }
    if (request.method === "GET" && path === "/api/tags") {
        try {
            const plcs = await readAllTags();
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
            response.end(JSON.stringify({ readAt: new Date().toISOString(), plcs }));
        } catch (error: unknown) {
            response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown read failure" }));
        }
        return;
    }
    if (request.method === "POST" && path === "/api/tags/write") {
        try {
            const body = await readJsonBody(request) as { nodeId?: unknown; value?: unknown };
            if (!isAllowedCommandNode(body.nodeId) || typeof body.value !== "boolean") {
                response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                response.end(JSON.stringify({ error: "Only Motor/Pump Start, Stop, and Reset Boolean command tags may be written." }));
                return;
            }
            const status = await writeBooleanTag(body.nodeId, body.value);
            response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ nodeId: body.nodeId, value: body.value, status }));
        } catch (error: unknown) {
            response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown write failure" }));
        }
        return;
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
}

createServer((request, response) => void handler(request, response)).listen(port, host, () => {
    console.log(`Dashboard available at http://${host}:${port}`);
});
