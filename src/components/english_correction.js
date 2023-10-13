import { useState } from "react";
import { auth } from "lib/firebase";


export default function EnglishCorrection() {

  const initialText = "I go to school yesterday. I eat apple for lunch. I like to eat apple.";
  const [text, setText] = useState(initialText);
  const [corrected, setCorrected] = useState(" ");
  const [samples, setSamples] = useState("-\n-\n-");
  const [buttonDisabled, setButtonDisabled] = useState(false);

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

      const response = await fetch(apiEndpoint, request);
      const data = await response.json();
      return data;
    };

    setButtonDisabled(true);
    setCorrected(" ");
    setSamples("-\n-\n-");

    const data = await callBackend();

    setCorrected(data.corrected);
    setSamples(data.samples);
    setButtonDisabled(false);
  }

  const element = (
    <div className="EC-Service">
      <textarea
        style={{resize: "none", width: "600px", height: "200px"}}
        value={text}
        onChange={(event) => setText(event.target.value)} />
      <br/>
      <button
        disabled={buttonDisabled}
        onClick={getAnswer}>Correct me!</button>
      <h2>Grammar correction</h2>
      <div style={{whiteSpace: "pre-wrap"}}>{corrected}</div>
      <h2>Model sentences</h2>
      <div style={{whiteSpace: "pre-wrap"}}>{samples}</div>
    </div>
  );

  return element;
}
