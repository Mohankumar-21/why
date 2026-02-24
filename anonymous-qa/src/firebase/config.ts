import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIHOltx6BmT97QxmMrVfoKkeLOa8dmXRM",
  authDomain: "anonymous-why.firebaseapp.com",
  databaseURL: "https://anonymous-why-default-rtdb.firebaseio.com",
  projectId: "anonymous-why",
  storageBucket: "anonymous-why.firebasestorage.app",
  messagingSenderId: "626572048049",
  appId: "1:626572048049:web:572cfd7ad82c87663e1490",
  measurementId: "G-24PR2VFHQ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);