/**
 * index.js – Oppty API server entry point
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analysisRouter = require("./routes/analysis");
const subscriptionsRouter = require("./routes/subscriptions");
const vaultRouter = require("./routes/vault");
const goalsRouter = require("./routes/goals");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", version: "1.0.0" }));

// Feature routes
app.use("/api/analysis", analysisRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/users", usersRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Oppty API running on http://localhost:${PORT}`));
}

module.exports = app;
