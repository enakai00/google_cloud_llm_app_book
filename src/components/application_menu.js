import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "lib/firebase";

export default function ApplicationMenu() {
  const displayName = auth.currentUser.displayName;
  const email = auth.currentUser.email;

  const element = (
    <div style={{ fontSize: "1.2rem" }}>
      Login user : {displayName}<br/>({email})<br/>
      <button onClick={() => signOut(auth)}>Logout</button>
      <div className="textlink">
        <ul>
          <li><Link href="./english_correction">English Correction AI Service</Link></li>
          <li><Link href="./fashion_compliment">Fashion Compliment AI Service</Link></li>
          <li><Link href="./filestore">Intelligent Filestore Service</Link></li>
          <li><Link href="./knowledge_drive">Knowledge Drive Application</Link></li>
        </ul>
      </div>
    </div>
  );

  return element;
}
