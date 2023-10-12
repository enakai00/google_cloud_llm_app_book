import { verifyIdToken } from "../../../config/middleware";

export default async function handler(req, res) {
  const decodedToken = await verifyIdToken(req);
  if (! decodedToken) {
    res.status(401).end();
    return;
  }

  const data = {
    corrected: "Corrected text.",
    samples: "- Sample1\n- Sample2\n- Sample3\n",
  };

  res.status(200).json(data);
}
