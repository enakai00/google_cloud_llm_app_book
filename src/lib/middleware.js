import admin from "firebase-admin";

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
