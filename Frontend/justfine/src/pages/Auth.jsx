import React, {useState} from 'react';
import "../static/Auth.css";

const API_URL = "http://127.0.0.1:5000"

function Auth(){
    const[isLogin,setIsLogin]=useState(true);
    const[username,setUserName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[confirmPassword,setConfirmPassword]=useState("");
    const[error,setError]=useState('');
    const[message,setMessage]=useState("");


     const showMessage=(text) => {
            setMessage(text);
            setTimeout(() => {
            setMessage("");
    }, 1000);
  }

     const handleSubmit=(e)=>{
        e.preventDefault();
         if(!username || !password){
            showMessage('Username and Passwords are required!');
            return;
         }
        try{
            const res=await fetch(`${API_URL}/register`,{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({username,email,password,confirmPassword})
            });

            const data=await res.json();
            if(res.ok){
                showMessage(data.message ||"User registered successfully");
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
            else{
                showMessage(data.error || data.message || "Register failed");
            }
        }
        catch(error){
            console.error("Register fetch error:", error);
            showMessage('Failed to connect server');
        }
    }

    const handleToggle=()=>{
        setIsLogin(!isLogin);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    }

    return(
        <div className="auth-container">
            <div className="auth-left">
                <div className="stickers-container">
                    <span className="sticker s1">💰</span>
                    <span className="sticker s2">💵</span>
                    <span className="sticker s3">📈</span>
                    <span className="sticker s4">🛍️</span>
                </div>
                <div className='brand-box'>
                    <h2>JustFine</h2>
                    <p>Get started with your personalized dashboard tracking setup</p>
                </div>
            </div>

            <div className='auth-right'>
                <div className='auth-card'>
                    <h2>{isLogin ? "Login" : "Register"}</h2>
                
                    <form onSubmit={handleSubmit} className='auth-form'>
                        <div className='input-group'>
                            <label>Username</label>
                            <input type='text' placeholder='Enter username' id='username' name='username' value={username} onChange={(e)=> setUserName(e.target.value)} required/>
                        </div>
                        {!isLogin && (
                            <div className='input-group'>
                                <label>Email</label>
                                <input type='email' placeholder='Enter email' id='email' name='email' value={email} onChange={(e)=> setEmail(e.target.value)} required/>
                            </div>
                        )}
                        <div className='input-group'>
                            <label>Password</label>
                            <input type='password' placeholder='Enter password' id='password' name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required/>
                        </div>
                    {!isLogin && (
                        <div className='input-group'>
                            <label>Confirm Password</label>
                            <input type='password' placeholder='Enter confirm password' id='confirmPassword' name='confirmPassword' value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} required/>
                        </div>
                     )}
                    <button type='submit' className='auth-btn'>
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>
                {message && <p className="message">{message}</p>}

                <p className='switch-text'>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span className='switch-link' onClick={handleToggle}>
                        {isLogin ? "Register" : "Login"}
                    </span>
                </p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
