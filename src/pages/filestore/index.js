import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "lib/firebase";
import Filestore from "components/filestore";


export default function FilestorePage() {
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
        <title>Intelligent Filestore</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Filestore />
      <div className="textlink">
      <br/><Link href="/">Back to main menu</Link>
      </div>
    </>
  );
}
