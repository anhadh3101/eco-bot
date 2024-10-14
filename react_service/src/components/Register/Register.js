import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Register.module.css'; // Import the CSS module

const LOGIN_HOST = process.env.REACT_APP_LOGIN_HOST;

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password || !username) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch(`${LOGIN_HOST}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, username }),
            });

            if (!response.ok) {
                throw new Error('Registration failed: ' + response.statusText);
            }

            const data = await response.json();
            console.log('User registered successfully:', data);

            // Optionally, redirect to login page or perform another action
            window.location.href = '/login';

            // Reset form
            setEmail('');
            setPassword('');
            setUsername('');
            setError('');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className={styles['register-container']}>
            <h2>Register</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
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
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
};

export default Register;
