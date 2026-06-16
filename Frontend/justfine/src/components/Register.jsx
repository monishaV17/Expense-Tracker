import React, {useState} from 'react';

function Register(onNavigateToLogin){
    const[formData,setformData]=useState({username:'',email:'',password:''});
    const[error,setError]=useState('');

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setformData((prev)=> ({...prev, [name]:value}));
    };

     const handleSubmit=(e)=>{
        e.preventDefault();
        setError('');

        if(!formData.username || !formData.email || !formData.password){
            setError('All fields are required');
            return;
            }
        if(formData.password<6){
            setError('Password must be at least 6 characters long.');
            return;
            }
    };

    return(
        <div className='auth-wrapper'>
            <div className='auth-card'>
                <div className='auth-header'>
                    <h2>Create Account</h2>
                    <p>Get started with your personalized dashboard tracking setup</p>
                </div>
                
                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className='form-group'>
                        <label htmlFor="username">Username</label>
                        <input type='text' placeholder='Enter username' id='username' name='username' value={formData.username} onChange={handleChange}/>
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input type='email' placeholder='Enter email' id='email' name='email' value={formData.email} onChange={handleChange}/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type='password' placeholder='Enter password' id='password' name='password' value={formData.password} onChange={handleChange}/>
                    </div>
                    <button type='submit' className='auth-submit-btn'>Register</button>
                </form>
                <div className="auth-footer">
                    <p>Already have an account?{' '}
                    <span onClick={onNavigateToLogin} className="auth-toggle-link">Sign in instead</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register;
