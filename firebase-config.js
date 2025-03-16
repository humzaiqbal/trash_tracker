// Your web app's Firebase configuration
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVBiN0pZq9FDCUB5XxC-ZNdEga3G357Ns",
  authDomain: "trash-tracker-9055d.firebaseapp.com",
  databaseURL: "https://trash-tracker-9055d-default-rtdb.firebaseio.com",
  projectId: "trash-tracker-9055d",
  storageBucket: "trash-tracker-9055d.firebasestorage.app",
  messagingSenderId: "762016169738",
  appId: "1:762016169738:web:6432b84391a5398316c4f3",
  measurementId: "G-8DJCTDGDCK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database(); 