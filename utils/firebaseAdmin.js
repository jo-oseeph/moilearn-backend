import 'dotenv/config';
import admin from "firebase-admin";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  try {
    // Try Render's secret file location first
    let serviceAccount;
    
    try {
      serviceAccount = JSON.parse(readFileSync('/etc/secrets/service-account.json', 'utf8'));
      console.log('✅ Firebase Admin initialized from Render secret file');
    } catch {
      // Fallback to local development path
      const localPath = join(__dirname, '..', 'service-account.json');
      serviceAccount = JSON.parse(readFileSync(localPath, 'utf8'));
      console.log('✅ Firebase Admin initialized from local service-account.json');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
  } catch (fileError) {
    // Fallback to environment variables
    console.log('⚠️ JSON file not found, using .env variables...');
    
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    
    console.log('✅ Firebase Admin initialized from .env variables');
  }
}

export default admin;
