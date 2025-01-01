// 'user server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { project } from 'gcp-metadata';
var admin = require('firebase-admin');

// Fetch the service account key JSON file contents
// var serviceAccount = require('../utils/adminsdk.json');

const privateKey = JSON.parse(process.env.FIREBASE_PRIVATE_KEY || '');
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey.privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com',
};

const firebaseAdminConfig = {
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export function customInitApp() {
  if (getApps().length <= 0) initializeApp(firebaseAdminConfig);
}
