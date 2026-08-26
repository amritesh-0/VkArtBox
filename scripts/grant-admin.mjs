import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const identifier = process.argv[2];
if (!identifier) {
  throw new Error('Usage: node scripts/grant-admin.mjs <Firebase-UID-or-email>');
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is required and must contain service-account JSON.');
}

if (!getApps().length) initializeApp({ credential: cert(JSON.parse(serviceAccount)) });

const auth = getAuth();
let user;
try {
  user = await auth.getUser(identifier);
} catch (error) {
  if (error.code !== 'auth/user-not-found') throw error;
  user = await auth.getUserByEmail(identifier);
}

await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log(`Granted the admin claim to ${user.email || user.uid}. They must sign out and sign in again.`);
