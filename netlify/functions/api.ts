import serverless from "serverless-http";
import express from "express";
import { createServer } from "../../server";

const innerApp = createServer();
const app = express();

// Expose the API under both the raw Netlify functions path and root
// Netlify redirects /api/* to /.netlify/functions/api/*
// When it reaches here, the path is /.netlify/functions/api/something
// Stripping /.netlify/functions makes it /api/something, which matches our routes!
app.use("/.netlify/functions", innerApp);
app.use("/", innerApp);

export const handler = serverless(app);

