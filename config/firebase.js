import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1zdAsPFjMtj64JXNJcz1DMY4EtWKSaKU",
  authDomain: "etsuji-react-example-379705.firebaseapp.com",
  projectId: "etsuji-react-example-379705",
  storageBucket: "etsuji-react-example-379705.appspot.com",
  messagingSenderId: "417550172325",
  appId: "1:417550172325:web:b616688540489089f50d4c"
};

export var app;

try {
  app = initializeApp(firebaseConfig);
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)
  }
}

export const auth = getAuth(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  signInWithPopup(auth, provider)
    .catch((error) => {console.log(error)})
};

export const projectId = firebaseConfig.projectId;
