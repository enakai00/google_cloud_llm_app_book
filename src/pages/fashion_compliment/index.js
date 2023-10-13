import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "lib/firebase";
import FashionCompliment from "components/fashion_compliment";


export default function FashionComplimentPage() {
  const [loginUser, setLoginUser] = useState(null);
  const router = useRouter()

  // Register login state change handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoginUser(user);
      if (! user) {
        router.replace("/");
      }
    });
    return unsubscribe;
  }, []);

  if (! loginUser) {
    return;
  }

  return (
    <>
      <Head>
        <title>Fashion Compliment AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style = {{ margin: "10px", width: "600px" }}>
        <FashionCompliment />
      </div>
      <div className="textlink">
      <br/><Link href="/">Back to main menu</Link>
      </div>
    </>
  );
}
