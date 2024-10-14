// src/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

const LOGIN_HOST = process.env.REACT_APP_LOGIN_HOST;

const Login = () => {
    const [email, setEmail] = useState(''); // Change from username to email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const response = await fetch(`${LOGIN_HOST}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            
            if (!response.ok) {
                throw new Error('Login failed', response.message);
            }

            const data = await response.json();

            console.log(data)
            window.location.href = data.modUrl;
            
            setEmail('');
            setPassword('');
            setError('');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className={styles['login-container']}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles['form-group']}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account?{' '}
                <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
