import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';

function Signup() {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // 2. Password mismatch check
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // 3. Password complexity check
        const missing = [];
        if (formData.password.length < 8 || formData.password.length > 15) missing.push('8-15 characters');
        if (!/[A-Z]/.test(formData.password)) missing.push('one uppercase letter');
        if (!/[a-z]/.test(formData.password)) missing.push('one lowercase letter');
        if (!/\d/.test(formData.password)) missing.push('one digit');
        if (!/[@$!%*?&]/.test(formData.password)) missing.push('one special character (@$!%*?&)');

        if (missing.length > 0) {
            setError(`Password is missing: ${missing.join(', ')}.`);
            return;
        }

        try {
            await signup(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing again
        if (error) setError('');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' }}>Sign Up</h2>
            {error && <p style={{ color: 'red', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '5px' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <button type="submit" style={{ padding: '0.8rem', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    Register
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
            </p>
        </div>
    );
}

export default Signup;
