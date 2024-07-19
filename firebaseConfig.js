// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtIWnCz1-3JUQNlmCrkLFQOs6QbT8Lmyw",
  authDomain: "project-c2f87.firebaseapp.com",
  projectId: "project-c2f87",
  storageBucket: "project-c2f87.appspot.com",
  messagingSenderId: "650111042622",
  appId: "1:650111042622:web:d214f5295e99c09627fd6f",
  measurementId: "G-ZSSGZBCTHF",
  databaseURL: "" // Add this to satisfy the requirement. I dont think its required if you're not using realtime database
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db }

