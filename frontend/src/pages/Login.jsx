import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <svg className="login-error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="login-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="login-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="login-options">
            <div className="remember-me">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="remember-checkbox"
              />
              <label htmlFor="remember-me" className="remember-label">
                Remember me
              </label>
            </div>

            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <div className="login-loading">
                <div className="loading-spinner"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="login-link">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;