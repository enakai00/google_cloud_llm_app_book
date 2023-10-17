import { useState, useEffect } from "react";
import { auth } from "lib/firebase";


export default function Filestore() {

  const [fileList, setFileList] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => { getFileList(); }, []);

  const getFileList = async () => {
    const newFileList = ['aaaaa.pdf', 'bbbbb.pdf', 'ccccc.pdf'];
    setFileList(newFileList);
  };

  const showSummary = async () => {
    setPopupText("aaaaa\nbbbbbbb");
    setShowPopup(true);
  }

  const fileListElement = [];
  for (let item of fileList) {
    const fileElement = (
      <div key={item} onClick={showSummary}>{item}</div>
    );
    fileListElement.push(fileElement);
  }

  const popupElement = (
    <div style={{
      position: "absolute", left: "100px", top: "50px",
      width: "400px", height: "300px", padding: "10px", margin: "10px",
      border: "1px solid", borderRadius: "10px", backgroundColor: "#f0f0f0"}}>
      {popupText}
      <div style={{position: "absolute", bottom: "10px", right: "10px"}}>
        <button onClick={() => setShowPopup(false)}>Close</button>
      </div>
    </div>
  );

  const element = (
    <>
      <div style={{
	      width: "600px", height: "400px",
              overflow: "scroll", overflowX: "hidden",
              padding: "10px", border: "1px solid"}}>
	  {fileListElement}
	  {showPopup && popupElement}
      </div>
      <br/>
      <button disabled={buttonDisabled}>Upload PDF</button>
    </>
  );

  return element;
}
