import { verifyIdToken } from "../../../config/middleware";
import admin from 'firebase-admin';
import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  // Client authentication
  const decodedToken = await verifyIdToken(req);
  if (! decodedToken) {
    res.status(401).end();
    return;
  }

  const endpoint = process.env.ENGLISH_CORRECTION_API;

  var auth;
  if (process.env.FIREBASE_PROVATE_KEY) {
    const credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
    auth = new GoogleAuth({
      credential: credential,
    });
  } else {
    auth = new GoogleAuth(); // Use server default credential
  }

  const client = await auth.getIdTokenClient(endpoint);
  const response = await client.request({
    url: endpoint,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      text: req.body.text,
    },
  });

  const data = response.data;

/*
  const data = {
    corrected: "Corrected text.",
    samples: "- Sample1\n- Sample2\n- Sample3\n",
  };
*/

  res.status(200).json(data);
}
