import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      toast.success('Login successful!');
      navigate('/admin');
    } else {
      toast.error('Authentication failed.');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="container-fluid py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Completing authentication, please wait...</p>
    </div>
  );
}
