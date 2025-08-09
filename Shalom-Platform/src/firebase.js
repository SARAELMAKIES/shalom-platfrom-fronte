// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-librariessr




// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBg-h2SQj_CqqiKpQlRSrxIeUNQGF6MzuI",
  authDomain: "shalom-ffa67.firebaseapp.com",
  projectId: "shalom-ffa67",
  storageBucket: "shalom-ffa67.firebasestorage.app",
  messagingSenderId: "520151164303",
  appId: "1:520151164303:web:3f0c8e64525f398b43d7fa",
  measurementId: "G-24XNTSKKQ6"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);