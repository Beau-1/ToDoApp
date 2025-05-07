import ToDoList from "./ToDoList";
import "./App.css";
document.addEventListener("DOMContentLoaded", (Event) => {
    const app = firebase.app();
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            document.write(`Hello ${user.displayName}`);
            console.log(user);
        })
        .catch(console.log);
}

function App() {
    return <ToDoList />;
}

export default App;
