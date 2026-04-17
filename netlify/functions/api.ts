import serverless from "serverless-http";
import express from "express";
import { createServer } from "../../server";

const innerApp = createServer();
const app = express();

// Bulletproof URL rewriting for Netlify Functions
app.use((req, res, next) => {
    // Netlify or serverless-http can pass the URL in various formats.
    // Clean it up to ensure it always evaluates as `/api/...` for our routers.
    let url = req.url;
    
    // Strip /.netlify/functions if present
    if (url.startsWith('/.netlify/functions')) {
        url = url.replace('/.netlify/functions', '');
    }
    
    // Strip redundant /api if it became /api/api/...
    if (url.startsWith('/api/api/')) {
        url = url.replace('/api/api/', '/api/');
    }
    
    // If it doesn't start with /api after stripping, add it
    // (e.g. if the function received `/auth/login` directly)
    if (!url.startsWith('/api')) {
        url = '/api' + (url.startsWith('/') ? '' : '/') + url;
    }
    
    req.url = url;
    next();
});

app.use(innerApp);

export const handler = serverless(app, {
    request: function(req: any, event: any, context: any) {
        // Expose the raw event so our base64 body parser in server/index.ts can use it!
        req.apiGateway = { event, context };
    }
});
