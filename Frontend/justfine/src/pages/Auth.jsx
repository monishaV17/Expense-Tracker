import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import "../static/Auth.css";

const API_URL = "http://127.0.0.1:5000/api/auth";

function Auth(){
    const[isLogin,setIsLogin]=useState(true);
    const[username,setUserName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[confirmPassword,setConfirmPassword]=useState("");
    const[message,setMessage]=useState("");

    const navigate = useNavigate();

     const showMessage=(text) => {
            setMessage(text);
            setTimeout(() => {
            setMessage("");
    }, 2000);
  }

    const resetForm = () =>{
        setUserName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

     const handleSubmit=async (e)=>{
        e.preventDefault();
         if(!username || !password){
            showMessage('Username and Password are required!');
            return;
         }

         if(!isLogin) {
            if(!email) {
                showMessage('Email is required for registration!');
                return;
            }
            if(password !== confirmPassword) {
                showMessage('Passwords do not match!');
                return;
            }
        }

        const endpoint=isLogin ? `${API_URL}/login` : `${API_URL}/register`;
        const payload=isLogin ? {username,password} : {username,email,password};

        try{
            const res=await fetch(endpoint,{
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(payload)
            });

            const data=await res.json();
            if(res.ok){
                if(data.token){
                    localStorage.setItem('token',data.token)
                }
                showMessage(data.message || (isLogin ? "Login Successful!" : "Registered Successfully!"));
                resetForm();

                setTimeout(() => {
                navigate('/dashboard');
                }, 1000);
            }
            else{
                showMessage(data.error || data.message || "Authentication failed");
            }
        }
        catch(error){
            console.error("Auth fetch error:", error);
            showMessage('Failed to connect server');
        }
    };

    const handleToggle=()=>{
        setIsLogin(!isLogin);
        setMessage('');
        resetForm();
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
