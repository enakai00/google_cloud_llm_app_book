import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, signInWithGoogle } from "lib/firebase";


export default function ApplicationMenu() {
  const [loginUser, setLoginUser] = useState(null);

  // Register login state change handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("login user:", user);
      setLoginUser(user);
    });
    return unsubscribe;
  }, []);

  let element;

  if (loginUser) {
    const displayName = auth.currentUser.displayName;
    const email = auth.currentUser.email;

    element = (
      <div style={{ fontSize: "1.2rem" }}>
        Login user : {displayName}<br/>({email})<br/>
        <button onClick={() => signOut(auth)}>Logout</button>
        <div className="textlink">
          <ul>
            <li><Link href="./english_correction">English Correction AI Service</Link></li>
            <li><Link href="./fashion_compliment">Fashion Compliment AI Service</Link></li>
            <li><Link href="./knowledge_drive">Knowledge Drive Application</Link></li>
          </ul>
        </div>
      </div>
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
