// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRXi5PudXZcTTVeL_5fAi-Flry2elnl9A",
  authDomain: "hoiseitgoing.firebaseapp.com",
  projectId: "hoiseitgoing",
  storageBucket: "hoiseitgoing.firebasestorage.app",
  messagingSenderId: "999100124077",
  appId: "1:999100124077:web:5cbcd64a79bac2cfa46f24",
  measurementId: "G-G145Z75KDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app);

export{app,auth};