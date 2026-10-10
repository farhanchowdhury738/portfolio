const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function handleSaveFile(req, res, targetFilename) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const parsed = JSON.parse(body);
      const filePath = path.join(__dirname, "data", targetFilename);

      // Ensure data directory exists
      const dataDir = path.join(__dirname, "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf8", (err) => {
        if (err) {
          console.error(`Error saving ${targetFilename}:`, err);
          sendJSON(res, 500, { success: false, error: err.message });
          return;
        }
        console.log(`Successfully updated data/${targetFilename}`);
        sendJSON(res, 200, {
          success: true,
          message: `Saved to data/${targetFilename}`,
        });
      });
    } catch (err) {
      console.error("JSON parse error on save:", err);
      sendJSON(res, 400, { success: false, error: "Invalid JSON format" });
    }
  });
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // API Endpoints to save JSON files directly on disk
  if (req.method === "POST") {
    if (req.url === "/api/save-projects") {
      handleSaveFile(req, res, "projects.json");
      return;
    }
    if (req.url === "/api/save-certificates") {
      handleSaveFile(req, res, "certificates.json");
      return;
    }
    if (req.url === "/api/save-volunteering") {
      handleSaveFile(req, res, "volunteering.json");
      return;
    }
    if (req.url === "/api/save-profile") {
      handleSaveFile(req, res, "profile.json");
      return;
    }
  }

  // Static File Serving
  let reqPath = decodeURI(req.url.split("?")[0].split("#")[0]);
  if (reqPath === "/") reqPath = "/index.html";

  const filePath = path.join(__dirname, reqPath);

  // Security: prevent path traversal outside project root
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
