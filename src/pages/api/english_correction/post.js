import { verifyIdToken } from "lib/middleware";
import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  // Client authentication
  const decodedToken = await verifyIdToken(req);
  if (! decodedToken) {
    res.status(401).end();
    return;
  }

  const endpoint = process.env.ENGLISH_CORRECTION_API;
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(endpoint);
  const request = {
    url: endpoint,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      text: req.body.text,
    },
  };

  const response = await client.request(request);
  const data = response.data;

  res.status(200).json(data);
}
