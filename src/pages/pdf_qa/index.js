import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "lib/firebase";
import PDF_QA from "components/pdf_qa";


export default function PDF_QA_Page() {
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
        <title>QA bot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style = {{ margin: "10px", width: "600px" }}>
        <PDF_QA />
      </div>
      <div className="textlink">
      <br/><Link href="/">Back to main menu</Link>
      </div>
    </>
  );
}
