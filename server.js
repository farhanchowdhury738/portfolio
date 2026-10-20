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
  ".webp": "image/webp",
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
function handleSaveCV(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const parsed = JSON.parse(body);
      if (!parsed.data) {
        sendJSON(res, 400, { success: false, error: "Missing CV file data" });
        return;
      }

      // parsed.data is base64 encoded string (data:application/pdf;base64,.... or raw base64)
      const base64Data = parsed.data.replace(/^data:application\/pdf;base64,/, "").replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const targetPath = path.join(__dirname, "Farhan-chowdhury-CV.pdf");

      fs.writeFile(targetPath, buffer, (err) => {
        if (err) {
          console.error("Error saving CV file:", err);
          sendJSON(res, 500, { success: false, error: err.message });
          return;
        }
        console.log("Successfully replaced Farhan-chowdhury-CV.pdf");
        sendJSON(res, 200, {
          success: true,
          message: "CV file replaced successfully!",
        });
      });
    } catch (err) {
      console.error("Error processing CV upload:", err);
      sendJSON(res, 400, { success: false, error: "Invalid upload request" });
    }
  });
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";
}

function handleUploadBlogImages(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const parsed = JSON.parse(body);
      const slug = slugify(parsed.slug || parsed.title || "post");
      const images = Array.isArray(parsed.images) ? parsed.images : [];
      if (images.length === 0) {
        sendJSON(res, 400, { success: false, error: "No images provided" });
        return;
      }

      const blogDir = path.join(__dirname, "images", "blog", slug);
      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }

      const savedPaths = [];
      let index = 1;
      for (const img of images) {
        if (!img.data) continue;
        const base64Data = String(img.data).replace(/^data:.*?;base64,/, "");
        const ext = getImageExtension(img.data, img.name);
        const filename = `${index}.${ext}`;
        const filePath = path.join(blogDir, filename);
        try {
          const buffer = Buffer.from(base64Data, "base64");
          fs.writeFileSync(filePath, buffer);
          savedPaths.push(`images/blog/${slug}/${filename}`);
          index++;
        } catch (e) {
          console.error("Error writing blog image:", e);
        }
      }

      sendJSON(res, 200, { success: true, paths: savedPaths, slug });
    } catch (err) {
      console.error("Error processing blog image upload:", err);
      sendJSON(res, 400, { success: false, error: "Invalid upload request" });
    }
  });
}

function getImageExtension(dataUrl, name) {
  const match = String(dataUrl).match(/^data:(image\/[^;]+);base64,/);
  if (match) {
    const mime = match[1];
    if (mime === "image/png") return "png";
    if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
    if (mime === "image/webp") return "webp";
    if (mime === "image/gif") return "gif";
  }
  const ext = name ? path.extname(name).toLowerCase().replace(".", "") : "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "jpg";
}

function handleDeleteBlogImages(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const parsed = JSON.parse(body);
      const slug = slugify(parsed.slug || "");
      if (!slug) {
        sendJSON(res, 400, { success: false, error: "Missing slug" });
        return;
      }
      const blogDir = path.join(__dirname, "images", "blog", slug);
      if (fs.existsSync(blogDir)) {
        try {
          const entries = fs.readdirSync(blogDir);
          for (const entry of entries) {
            const p = path.join(blogDir, entry);
            const stat = fs.statSync(p);
            if (stat.isFile()) {
              fs.unlinkSync(p);
            }
          }
          try {
            fs.rmdirSync(blogDir);
          } catch (e) {
            // ignore if not empty
          }
        } catch (e) {
          console.error("Error deleting blog images:", e);
        }
      }
      sendJSON(res, 200, { success: true });
    } catch (err) {
      console.error("Error processing blog image deletion:", err);
      sendJSON(res, 400, { success: false, error: "Invalid request" });
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
    if (req.url === "/api/save-experience") {
      handleSaveFile(req, res, "experience.json");
      return;
    }
    if (req.url === "/api/save-skills") {
      handleSaveFile(req, res, "skills.json");
      return;
    }
    if (req.url === "/api/save-profile") {
      handleSaveFile(req, res, "profile.json");
      return;
    }
    if (req.url === "/api/save-about") {
      handleSaveFile(req, res, "about.json");
      return;
    }
    if (req.url === "/api/save-posts") {
      handleSaveFile(req, res, "posts.json");
      return;
    }
    if (req.url === "/api/upload-cv") {
      handleSaveCV(req, res);
      return;
    }
    if (req.url.startsWith("/api/upload-blog-images")) {
      handleUploadBlogImages(req, res);
      return;
    }
    if (req.url.startsWith("/api/delete-blog-images")) {
      handleDeleteBlogImages(req, res);
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
