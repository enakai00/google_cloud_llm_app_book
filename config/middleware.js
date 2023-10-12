import admin from 'firebase-admin';

var app;
try {
  const credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });
  app = admin.initializeApp({
    credential: credential,
  });
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)
  }
}

export async function verifyIdToken(req) {
  const idToken = req.body.token;
  var decodedToken
  try {
    decodedToken = await admin.auth(app).verifyIdToken(idToken);
  } catch (err) {
    decodedToken = null;
  }
  return decodedToken;
}
