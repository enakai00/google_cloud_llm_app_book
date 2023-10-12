import Head from "next/head";
import Link from "next/link";
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase";


export default function Home() {
  const [loginUser, setLoginUser] = useState(null);
  const router = useRouter()

  // Register login state change handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("login user:", user);
      setLoginUser(user);
      if (! user) {
        router.replace("/");
      }
    });
    return unsubscribe;
  }, []);

  const initialText = "I go to school yesterday. I eat apple for lunch. I like to eat apple.";
  const [text, setText] = useState(initialText);
  const [corrected, setCorrected] = useState(" ");
  const [samples, setSamples] = useState("-\n-\n-\n");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  if (! loginUser) {
    return;
  }

  // Application main
  const getAnswer = async () => {
    const callBackend = async () => {
      const inputText = text.replace(/\r?\n/g, '');
      const apiEndpoint = "/api/english_correction/post";

      const token = await auth.currentUser.getIdToken();
      const request = {  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          text: inputText,
        })
      };

      const res = await fetch(apiEndpoint, request);
      const data = await res.json();
      return data;
    };

    setButtonDisabled(true);
    setCorrected(" ");
    setSamples("-\n-\n-\n");

    const data = await callBackend();

    setCorrected(data.corrected);
    setSamples(data.samples);
    setButtonDisabled(false);
  }

  const element = (
        <div className="EC-Service">
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
          <br/>
          <button disabled={buttonDisabled} onClick={getAnswer}>Correct me!</button>
          <h2>Grammar correction</h2>
          <div className="text">{corrected}</div>
          <h2>Model sentences</h2>
          <div className="text">{samples}</div>
        </div>
  );

  return (
    <>
      <Head>
        <title>English Correction AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>{element}</div>
      <div className="textlink">
      <br/><Link href="/">Back to main menu</Link>
      </div>
    </>
  );
}
