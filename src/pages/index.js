import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, signInWithGoogle } from "lib/firebase";
import ApplicationMenu from "components/application_menu";


export default function ApplicationMenuPage() {
  const [loginUser, setLoginUser] = useState(null);

  // Register login state change handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoginUser(user);
    });
    return unsubscribe;
  }, []);

  let element;

  if (loginUser) {
    element = (
      <ApplicationMenu />
    );
  } else {
    element = (
      <>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Google Cloud LLM Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>{element}</div>
    </>
  );
}
