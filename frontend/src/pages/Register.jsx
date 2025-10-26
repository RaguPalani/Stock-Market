import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Check if passwords match for real-time validation
  const passwordsMatch = formData.password && formData.confirmPassword && 
                        formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.password && formData.confirmPassword && 
                           formData.password !== formData.confirmPassword;

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">👤</div>
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join our community today</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="register-error">
              <svg className="register-error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <div className="register-form-group">
            <label htmlFor="username" className="register-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="register-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email" className="register-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="register-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password" className="register-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="register-input"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={`register-input ${passwordsMatch ? 'password-match' : ''} ${passwordsMismatch ? 'password-mismatch' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? (
              <div className="register-loading">
                <div className="register-loading-spinner"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="register-link">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;