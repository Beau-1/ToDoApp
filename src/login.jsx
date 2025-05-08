import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./Login.css";

const Login = ({ auth }) => {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="login-container">
            <button onClick={handleLogin}>Sign in with Google</button>
        </div>
    );
};

export default Login;
