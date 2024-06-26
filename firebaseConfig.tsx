// Import the functions you need from the SDKs you need
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
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
  measurementId: "G-ZSSGZBCTHF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

export { firebase, db }

