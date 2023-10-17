import { useState, useEffect } from "react";
import { auth } from "lib/firebase";
import { getStorage, getBlob, ref, listAll } from "firebase/storage";


export default function Filestore() {

  const [fileList, setFileList] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => { getFileList(); }, []);

  const getFileList = async () => {
    const storage = getStorage();
    const uid = auth.currentUser.uid;
    let listRef = ref(storage, uid + "/summary");
    let res = await listAll(listRef);
    const summaryList = [];
    for (let item of res.items) {
      summaryList.push(item.name.replace(/(.txt$)/, ".pdf"));
    }

    listRef = ref(storage, uid);
    res = await listAll(listRef);
    const newFileList = [];
    for (let item of res.items) {
      let summary = false;
      if (summaryList.includes(item.name)) {
        summary = true;        
      }
      newFileList.push({filename: item.name, summary: summary});
    }

    setFileList(newFileList);
  };

  const showSummary = async (filename) => {
    setPopupText("Loading...");
    setShowPopup(true);
    const storage = getStorage();
    const uid = auth.currentUser.uid;
    const filepath = uid + "/summary/" + filename.replace(/(.pdf$)/, ".txt");
    const summaryBlob = await getBlob(ref(storage, filepath));
    const summaryText = await summaryBlob.text();
    setPopupText(summaryText);
  }

  const infoButton = (item) => {
    var buttonElement;
    if (item.summary) {	  	
      buttonElement = (
        <span className="circle" style={{cursor: "pointer"}}
	      onClick={() => showSummary(item.filename)}>i</span>
      );
    } else {    
      buttonElement = (
        <span className="circle" style={{backgroundColor: "#fff"}}> </span>
      );
    }
    return buttonElement;
  };

  const fileListElement = [];
  for (let item of fileList) {
    const fileElement = (
      <div key={item.filename}
           style={{height: "1.8rem", lineHeight: "1.8rem"}}>
	{infoButton(item)} {item.filename}
      </div>
    );
    fileListElement.push(fileElement);
  }

  const popupElement = (
    <div style={{position: "absolute", left: "100px", top: "50px",
                 width: "400px", height: "300px",
                 padding: "10px", margin: "10px",
                 border: "1px solid", borderRadius: "10px",
		 backgroundColor: "#f0f0f0"}}>
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
