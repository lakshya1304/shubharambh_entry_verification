"use client";

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import styles from './register.module.css';

export default function Register() {
  const [identifierType, setIdentifierType] = useState<'appNo' | 'uid'>('appNo');
  const [formData, setFormData] = useState({
    name: '',
    applicationNumber: '',
    uid: '',
    email: '',
    department: 'BTech',
    semester: '',
    phone: '',
    amountPaid: '',
    paymentStatus: 'Paid'
  });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Lakshya@2203') {
      sessionStorage.setItem('isAdmin', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className={`glass-card ${styles.card}`} style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
            <h1 className="neon-text" style={{ marginBottom: '20px' }}>Admin Access</h1>
            <p style={{ marginBottom: '20px', color: '#a0a0a0' }}>Please enter the admin password to access registration.</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
              {authError && <div style={{ color: '#ff4d4d', fontSize: '14px', marginTop: '-5px' }}>{authError}</div>}
              <button type="submit" className="btn-primary">LOGIN</button>
            </form>
          </div>
        </main>
      </>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const submitData = { ...formData };
      if (identifierType === 'appNo') {
        submitData.uid = '';
      } else {
        submitData.applicationNumber = '';
      }

      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'STUDENT REGISTERED SUCCESSFULLY' });
        setFormData({
          name: '',
          applicationNumber: '',
          uid: '',
          email: '',
          department: 'BTech',
          semester: '',
          phone: '',
          amountPaid: '',
          paymentStatus: 'Paid'
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Internal server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.header}>
            <h1 className="neon-text">New Registration</h1>
            <p>Admin Only: Manually register a new participant.</p>
          </div>

          {message && (
            <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Student Name *</label>
                <input 
                  type="text" 
                  name="name"
                  className="input-field" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Identifier Type *</label>
                <select 
                  className="input-field" 
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value as 'appNo' | 'uid')}
                >
                  <option value="appNo">Application Number</option>
                  <option value="uid">UID</option>
                </select>
              </div>

              {identifierType === 'appNo' ? (
                <div className={styles.formGroup}>
                  <label>Application Number *</label>
                  <input 
                    type="text" 
                    name="applicationNumber"
                    className="input-field" 
                    value={formData.applicationNumber}
                    onChange={handleChange}
                    required 
                  />
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>UID *</label>
                  <input 
                    type="text" 
                    name="uid"
                    className="input-field" 
                    value={formData.uid}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="input-field" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Department *</label>
                <select 
                  name="department"
                  className="input-field" 
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="BTech">BTech</option>
                  <option value="BCA">BCA</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Semester</label>
                <input 
                  type="text" 
                  name="semester"
                  className="input-field" 
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="e.g., 1st, 2nd"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="input-field" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Amount Paid (₹) *</label>
                <input 
                  type="number" 
                  name="amountPaid"
                  className="input-field" 
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required 
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Payment Status *</label>
                <select 
                  name="paymentStatus"
                  className="input-field" 
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>


            </div>

            <div className={styles.actions}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'REGISTERING...' : 'REGISTER STUDENT'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

