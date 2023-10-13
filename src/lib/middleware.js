import admin from "firebase-admin";

/*
var app;
try {
  app = admin.initializeApp();
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)
  }
}
*/
const app = admin.initializeApp();

export async function verifyIdToken(req) {
  const idToken = req.body.token;
  var decodedToken;
  try {
    decodedToken = await admin.auth(app).verifyIdToken(idToken);
  } catch (err) {
    decodedToken = null;
  }
  return decodedToken;
}
