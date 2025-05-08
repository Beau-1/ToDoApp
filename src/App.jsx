// Imports required functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, addDoc } from "firebase/firestore";

// Imports CSS styles
import "./App.css";

// Imports the ToDoList component
import ToDoList from "./ToDoList";

// Firebase configuration object with credentials and project identifiers
const firebaseConfig = {
    apiKey: "AIzaSyBBOzhxKc122mUd_wz_KzGPI5i3x7x4LKE",
    authDomain: "to-do-app-5a99d.firebaseapp.com",
    projectId: "to-do-app-5a99d",
    storageBucket: "to-do-app-5a99d.firebasestorage.app",
    messagingSenderId: "765432115175",
    appId: "1:765432115175:web:81f091f0ed8972ff411742",
    measurementId: "G-2PCEMQQ40Q",
};

// Initialize the Firebase application using the config object
const app = initializeApp(firebaseConfig);

// Initialize Firestore database and get a reference to use it
const db = getFirestore(app);

// Main React component
function App() {
    return (
        <>
            <ToDoList db={db} />
        </>
    );
}

// Export the App component as default
export default App;

//  Google authentication with Firebase
// document.addEventListener("DOMContentLoaded", (Event) => {
//     const app = firebase.app();
// });

// function googleLogin() {
//     const provider = new firebase.auth.GoogleAuthProvider();
//     firebase
//         .auth()
//         .signInWithPopup(provider)
//         .then((result) => {
//             const user = result.user;
//             document.write(`Hello ${user.displayName}`);
//             console.log(user);
//         })
//         .catch(console.log);
// }
