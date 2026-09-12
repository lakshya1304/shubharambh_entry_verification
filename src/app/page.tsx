"use client";

import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import styles from './page.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [identifier, setIdentifier] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 seconds just in case of multiple terminals
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/participants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      setVerifyResult(data);
      
      if (data.status === 'VERIFIED') {
        fetchStats(); // Update stats immediately
      }
    } catch (err) {
      setVerifyResult({ status: 'ERROR', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
      setIdentifier('');
      // Refocus input for next scan
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.dashboardGrid}>
          {/* Left Column - Entry Verification */}
          <div className={styles.verificationSection}>
            <div className={`glass-card ${styles.entryCard}`}>
              <h1 className="neon-text">WELCOME TO SHUBHARAMBH 2.0</h1>
              <p className={styles.subhead}>Freshers Party – ICFAI University Tech Department</p>

              <form onSubmit={handleVerify} className={styles.verifyForm}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter Application Number or UID"
                  className={`input-field ${styles.largeInput}`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <button type="submit" className={`btn-primary ${styles.verifyBtn}`} disabled={loading || !identifier}>
                  {loading ? 'VERIFYING...' : 'VERIFY ENTRY'}
                </button>
              </form>

              {verifyResult && (
                <div className={`${styles.resultPanel} ${
                  verifyResult.status === 'VERIFIED' ? 'status-success' :
                  verifyResult.status === 'DUPLICATE' ? 'status-error' :
                  'status-warning'
                }`}>
                  {verifyResult.status === 'VERIFIED' && (
                    <>
                      <div className={styles.resultIcon}>✓ ENTRY VERIFIED</div>
                      <div className={styles.resultDetails}>
                        <p><strong>Name:</strong> {verifyResult.participant?.name}</p>
                        <p><strong>App No:</strong> {verifyResult.participant?.applicationNumber}</p>
                        <p><strong>UID:</strong> {verifyResult.participant?.uid || 'N/A'}</p>
                        <p><strong>Department:</strong> {verifyResult.participant?.department}</p>
                        <p className={styles.timestamp}><strong>Entry Time:</strong> {new Date(verifyResult.participant?.entryTimestamp).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {verifyResult.status === 'DUPLICATE' && (
                    <>
                      <div className={styles.resultIcon}>✕ ENTRY ALREADY USED</div>
                      <div className={styles.resultDetails}>
                        <p><strong>Name:</strong> {verifyResult.participant?.name}</p>
                        <p><strong>App No:</strong> {verifyResult.participant?.applicationNumber}</p>
                        <p><strong>UID:</strong> {verifyResult.participant?.uid || 'N/A'}</p>
                        <p className={styles.timestamp}><strong>First Entry:</strong> {new Date(verifyResult.participant?.entryTimestamp).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {(verifyResult.status === 'NOT_FOUND' || verifyResult.status === 'ERROR') && (
                    <>
                      <div className={styles.resultIcon}>⚠ {verifyResult.status === 'NOT_FOUND' ? 'STUDENT NOT FOUND' : 'ERROR'}</div>
                      <p>{verifyResult.message}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Recent Entries */}
          <div className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className="glass-card stat-card">
                <span className="stat-label">Total Participants</span>
                <span className="stat-value">{stats?.totalParticipants ?? '-'}</span>
              </div>
              <div className="glass-card stat-card">
                <span className="stat-label">Total Money Collected</span>
                <span className="stat-value">₹{stats?.totalMoneyCollected?.toLocaleString('en-IN') ?? '-'}</span>
              </div>
              <div className="glass-card stat-card">
                <span className="stat-label">Entries Completed</span>
                <span className="stat-value">{stats?.entriesCompleted ?? '-'}</span>
              </div>
              <div className="glass-card stat-card">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">{stats?.remaining ?? '-'}</span>
              </div>
            </div>

            <div className={`glass-card ${styles.recentCard}`}>
              <div className={styles.recentHeader}>
                <h3 className="neon-text">ENTRY COUNTER</h3>
                <div className={styles.counterStats}>
                  {stats?.entriesCompleted ?? 0} / {stats?.totalParticipants ?? 0}
                  <span> ({stats?.totalParticipants ? Math.round((stats.entriesCompleted / stats.totalParticipants) * 100) : 0}% Checked In)</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${stats?.totalParticipants ? Math.round((stats.entriesCompleted / stats.totalParticipants) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <h4 className={styles.recentTitle}>Recent Entries</h4>
              <div className={styles.recentList}>
                {stats?.recentEntries?.length > 0 ? (
                  stats.recentEntries.map((entry: any) => (
                    <div key={entry.id} className={styles.recentItem}>
                      <div className={styles.recentInfo}>
                        <span className={styles.recentName}>{entry.name}</span>
                        <span className={styles.recentUid}>UID: {entry.uid || 'N/A'}</span>
                      </div>
                      <span className={styles.recentTime}>
                        Entered: {new Date(entry.entryTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noEntries}>No recent entries.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
