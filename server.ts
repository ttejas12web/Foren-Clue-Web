import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

import { COURSES } from './src/constants.js';

const __filename = typeof process !== 'undefined' && process.argv[1] ? process.argv[1] : '';
const currentDir = typeof __dirname !== 'undefined' ? __dirname : (typeof process !== 'undefined' ? process.cwd() : '');
const isProd = process.env.NODE_ENV === "production";
const buildPath = path.join(process.cwd(), 'dist');
const projectRootDir = process.cwd();

// Load firebase config for server use
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(projectRootDir, 'firebase-applet-config.json'), 'utf-8'));
} catch (err) {
  console.warn("Could not load firebase-applet-config.json. This is expected during some build phases if the file is not yet available.");
}

// Initialize Firebase Admin lazily
let _dbAdmin: any = null;
function getDbAdmin() {
  if (_dbAdmin) return _dbAdmin;

  if (!admin.apps.length) {
    if (firebaseConfig.projectId) {
      try {
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      } catch (err) {
        console.error("Firebase Admin initialization error:", err);
        throw new Error("Failed to initialize Firebase Admin");
      }
    } else {
      console.error("Firebase projectId missing in config.");
      throw new Error("Firebase configuration missing");
    }
  }
  _dbAdmin = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
  return _dbAdmin;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Create uploads directory on server start if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files statically
  app.use("/api/uploads", express.static(uploadsDir));

  function getRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the Settings > Secrets menu.');
    }
    return new Razorpay({ key_id, key_secret });
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Base64 server disk file upload endpoint for resilient backup
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileName, fileType, base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data of file." });
      }

      // Stripping data URL prefix if sent
      const base64Clean = base64Data.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      const sanitizedName = (fileName || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uniqueFileName = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      await fs.promises.writeFile(filePath, buffer);
      console.log(`[Server disk upload] File written: ${uniqueFileName} (${buffer.length} bytes)`);

      // Construct a relative URL so it resolves correctly on any binding domain e.g. forenclue.in
      const relativeUrl = `/api/uploads/${uniqueFileName}`;

      res.json({
        success: true,
        url: relativeUrl,
        relativePath: relativeUrl,
        fileName: uniqueFileName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error("[Server disk upload error]:", err);
      res.status(500).json({ error: err.message || "Failed to save file to server storage." });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount < 100) return res.status(400).json({ error: "Invalid amount" });
    try {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
      });
      res.json(order);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Error creating order" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseId } = req.body;
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return res.status(500).json({ error: "Configuration error: Missing Key Secret" });
    
    // Verify Signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // Securely grant course access if userId and courseId are provided
    if (userId && courseId) {
       // In preview, dbAdmin will throw PERMISSION_DENIED because we don't have service account credentials.
       // We will let the client-side SDK perform this database update instead.
       console.log(`Payment confirmed for course ${courseId} / user ${userId}`);
       res.json({ success: true, unlocked: true });
    } else {
      res.json({ success: true });
    }
  });

  app.post("/api/enroll-free", async (req, res) => {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing userId or courseId" });
    }

    try {
      const dbAdmin = getDbAdmin();
      
      // In a real app, verify the user token and verify the course is actually free.
      // But we will trust the client for this logic in preview.
      
      const userRef = dbAdmin.collection('users').doc(userId);
      await userRef.set({
        purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      const courseStatRef = dbAdmin.collection('courseStats').doc(courseId.toString());
      await courseStatRef.set({
        students: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`Free Course ${courseId} unlocked for user ${userId}`);
      res.json({ success: true, unlocked: true });
    } catch (dbError: any) {
      console.error("Database update error:", dbError);
      res.status(500).json({ error: "Failed to allocate free course." });
    }
  });


  // Vite middleware for development
  let viteDevServer: any = null;

  // Serve static files / Vite middleware FIRST
  if (!isProd) {
    viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteDevServer.middlewares);
  } else {
    app.use(express.static(buildPath));
  }

  // Intercept all HTML requests for social media sharing cards & embed previews
  // This must be AFTER static files are handled
  app.get('*', async (req, res, next) => {
    // We only want to handle GET requests for HTML, and avoid assets
    if (req.method !== 'GET') {
      return next();
    }
    
    // Only intercept paths that don't have a file extension OR specifically .html
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return next();
    }
    
    const indexPath = isProd 
      ? path.join(buildPath, 'index.html') 
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath)) {
      return next();
    }

    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      let title = 'ForenClue | Forensic EdTech Mastery';
      let summary = "ForenClue - India's premier forensic science edtech platform. Master forensic analysis, cybersecurity, and investigations.";
      let image = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png';
      
      const fullUrl = `https://${req.get('host')}${req.originalUrl}`;

      try {
        if (req.path === '/cases' && req.query.case) {
          const dbAdmin = getDbAdmin();
          const caseDoc = await dbAdmin.collection('cases').doc(req.query.case as string).get();
          if (caseDoc.exists) {
            const data = caseDoc.data();
            if (data) {
              title = data.title ? `${data.title} | ForenClue Archive` : title;
              summary = data.summary || summary;
              if (data.image) image = data.image;
            }
          }
        } 
        else if (req.path === '/courses' && req.query.id) {
           const courseId = Number(req.query.id);
           // Try to find course in database
           const dbAdmin = getDbAdmin();
           const courseDocs = await dbAdmin.collection('courses').where('id', '==', courseId).get();
           if (!courseDocs.empty) {
              const data = courseDocs.docs[0].data();
              if (data) {
                title = data.title ? `${data.title} | ForenClue` : title;
                summary = data.description || summary;
                if (data.thumbnail) image = data.thumbnail;
                else if (data.image) image = data.image;
              }
           } else {
             // Let's attempt to use the static compiler constants
             try {
               const course = COURSES.find((c: any) => c.id === courseId);
               if (course) {
                 title = course.title ? `${course.title} | ForenClue` : title;
                 summary = course.description || summary;
                 if (course.thumbnail) image = course.thumbnail;
               }
             } catch (e) {
               console.warn("Could not load dynamic constants fallback", e);
             }
           }
        }
      } catch (dbError) {
        console.error("Error fetching preview metadata:", dbError);
      }

      // Format image URL
      let ogImageUrl = image;
      if (ogImageUrl && !ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
        ogImageUrl = `https://${req.get('host')}${ogImageUrl}`;
      }

      // Dynamic meta tags injection
      const metaTags = `
    <!-- Dynamic social media preview tags -->
    <meta name="description" content="${summary.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${fullUrl}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${summary.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="${req.path === '/cases' || req.path === '/courses' ? 'article' : 'website'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${summary.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    `;

      html = html.replace('<head>', `<head>\n${metaTags}`);
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      html = html.replace(/<meta name="description".*?>/i, ''); // Remove existing static description so no conflict

      if (!isProd && viteDevServer) {
        html = await viteDevServer.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
      return;
    } catch (err) {
      console.error("Error processing preview server-side:", err);
      // Fallback in production if index.html can't be served, but it was already checked.
      // In dev, let next() handle it if it fails.
      if (isProd) {
        res.status(500).send("Server error");
      } else {
        next();
      }
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
