import 'dotenv/config';
import admin from "firebase-admin";
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!admin.apps.length) {
  try {
    let serviceAccount;
    let loadedFrom = '';
    
    // Try multiple paths in order
    const possiblePaths = [
      '/etc/secrets/service-account.json',  // Render secret file location
      join(__dirname, '..', 'service-account.json'),  // Local development
      './service-account.json',  // Alternative local path
    ];
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        serviceAccount = JSON.parse(readFileSync(path, 'utf8'));
        loadedFrom = path;
        break;
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log(`✅ Firebase Admin initialized from: ${loadedFrom}`);
    } else {
      throw new Error('service-account.json not found in any expected location');
    }
    
  } catch (fileError) {
    // Fallback to environment variables
    console.log('⚠️ JSON file not found, using .env variables...');
    console.log('Error:', fileError.message);
    
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ FIREBASE_PRIVATE_KEY is missing from environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('FIREBASE')));
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
