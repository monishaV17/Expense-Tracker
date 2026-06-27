import React, {useState} from 'react';
import "../static/Auth.css";
function Auth(){
    const[isLogin,setIsLogin]=useState(true);
    const[formData,setformData]=useState({username:'',email:'',password:'',confirmPassword:''});
    const[error,setError]=useState('');

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setformData((prev)=> ({...prev, [name]:value}));
    };

     const handleSubmit=(e)=>{
        e.preventDefault();
        setError('');
    };

    const handleToggle=()=>{
        setIsLogin(!isLogin);
        setformData({username:'',email:'',password:'',confirmPassword:''});
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
                            <input type='text' placeholder='Enter username' id='username' name='username' value={formData.username} onChange={handleChange} required/>
                        </div>
                        {!isLogin && (
                            <div className='input-group'>
                                <label>Email</label>
                                <input type='email' placeholder='Enter email' id='email' name='email' value={formData.email} onChange={handleChange} required/>
                            </div>
                        )}
                        <div className='input-group'>
                            <label>Password</label>
                            <input type='password' placeholder='Enter password' id='password' name='password' value={formData.password} onChange={handleChange} required/>
                        </div>
                    {!isLogin && (
                        <div className='input-group'>
                            <label>Confirm Password</label>
                            <input type='password' placeholder='Enter confirm password' id='confirmPassword' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} required/>
                        </div>
                     )}
                    <button type='submit' className='auth-btn'>
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

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
