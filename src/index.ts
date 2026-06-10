import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { verifyConnection } from "./mailer";
import emailRoutes from "./routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", emailRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[unhandled]", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`\nServer listening on http://localhost:${PORT}`);
  console.log(`    Health → GET  /api/health`);
  console.log(`    Single → POST /api/send-email`);
  console.log(`    Bulk   → POST /api/send-bulk-email\n`);

  try {
    await verifyConnection();
    console.log("SMTP connected (Zoho)\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌  Gmail SMTP failed: ${message}`);
    console.error(
      "    → Check ZOHO_USER and ZOHO_PASS in your .env (App Password or SMTP password)\n"
    );
  }
});