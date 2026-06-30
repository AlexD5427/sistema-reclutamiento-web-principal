import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Proxy endpoint for Google Sheets sync
  app.get("/api/applicants", async (req, res) => {
    try {
      const url = "https://script.google.com/macros/s/AKfycby5iqFsfvuL6movHAfZ46CZZuND22M1J-R-D3BLv2mx-a8lmRa_AePbmV59jPRTA-hczQ/exec";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // slightly longer timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        redirect: "follow"
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Google Sheets script responded with status: ${response.status}`);
      }
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      // Quietly fall back to empty array and load local copy on the frontend
      console.log("Local applicants sync is active (external sheets data is sleeping). Status:", err.message);
      return res.json([]);
    }
  });

  // API Proxy endpoint for updating candidate sheets row
  app.post("/api/applicants/update", async (req, res) => {
    try {
      const url = "https://script.google.com/macros/s/AKfycby5iqFsfvuL6movHAfZ46CZZuND22M1J-R-D3BLv2mx-a8lmRa_AePbmV59jPRTA-hczQ/exec";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
        redirect: "follow"
      });
      clearTimeout(timeoutId);
      
      return res.json({ success: true });
    } catch (err: any) {
      console.log("Local sync update delayed or bypassed. Status:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
