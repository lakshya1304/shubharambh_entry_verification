"use client";

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import styles from './participants.module.css';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/participants?page=${page}&limit=20&search=${encodeURIComponent(search)}&filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [page, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchParticipants();
  };

  const handleDelete = async (id: number) => {
    const password = window.prompt("Enter admin password to delete participant:");
    if (password === null) return; // User cancelled

    if (password !== 'Lakshya@2203') {
      alert("Invalid password!");
      return;
    }

    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        alert("Participant deleted successfully.");
        fetchParticipants();
      } else {
        const data = await res.json();
        alert(data.message || "Deletion failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during deletion.");
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch all participants without pagination
      const res = await fetch(`/api/participants?limit=1000000`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data = await res.json();
      const allParticipants = data.participants || [];

      // Create a workbook
      const wb = XLSX.utils.book_new();

      const processData = (list: any[]) => {
        return list.map((p: any) => ({
          'UID': p.uid || '-',
          'Application No': p.applicationNumber || '-',
          'Name': p.name,
          'Email': p.email || '-',
          'Phone': p.phone || '-',
          'Department': p.department,
          'Payment Status': p.paymentStatus,
          'Entry Status': p.entryStatus,
          'Entry Time': p.entryTimestamp ? new Date(p.entryTimestamp).toLocaleString() : '-'
        }));
      };

      // Filter logic
      const isBCA = (dept: string) => dept && dept.toLowerCase().includes('bca');
      const isBTech = (dept: string) => dept && dept.toLowerCase().includes('btech');
      const isDiploma = (dept: string) => dept && dept.toLowerCase().includes('diploma');
      const isOther = (dept: string) => !isBCA(dept) && !isBTech(dept) && !isDiploma(dept);

      // Separate into UID and AppNo lists
      const uidList = allParticipants.filter((p: any) => p.uid && p.uid.trim() !== '');
      const appNoList = allParticipants.filter((p: any) => p.applicationNumber && p.applicationNumber.trim() !== '');

      // UID Sheets
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(uidList.filter((p: any) => isBCA(p.department)))), "UID - BCA");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(uidList.filter((p: any) => isBTech(p.department)))), "UID - BTech");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(uidList.filter((p: any) => isDiploma(p.department)))), "UID - Diploma");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(uidList.filter((p: any) => isOther(p.department)))), "UID - Others");

      // AppNo Sheets
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(appNoList.filter((p: any) => isBCA(p.department)))), "AppNo - BCA");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(appNoList.filter((p: any) => isBTech(p.department)))), "AppNo - BTech");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(appNoList.filter((p: any) => isDiploma(p.department)))), "AppNo - Diploma");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData(appNoList.filter((p: any) => isOther(p.department)))), "AppNo - Others");

      // Download
      XLSX.writeFile(wb, "Shubharambh_Participants.xlsx");
    } catch (err) {
      console.error(err);
      alert("An error occurred during export.");
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
            <h1 className="neon-text">Participant Database</h1>
            <div className={styles.controls}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search Name, UID, App No..."
                  className={`input-field ${styles.searchInput}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className={`btn-primary ${styles.searchBtn}`}>Search</button>
              </form>
              <select 
                className={`input-field ${styles.filterSelect}`}
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Participants</option>
                <option value="ENTERED">Entered Only</option>
                <option value="NOT_ENTERED">Not Entered</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
              <button onClick={handleExport} className={`btn-primary ${styles.searchBtn}`} disabled={loading} style={{ marginLeft: '10px', backgroundColor: '#10b981' }}>
                {loading ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>App No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Payment</th>
                    <th>Entry Status</th>
                    <th>Entry Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((p: any) => (
                      <tr key={p.id}>
                        <td className={styles.uid}>{p.uid}</td>
                        <td>{p.applicationNumber}</td>
                        <td className={styles.name}>{p.name}</td>
                        <td>{p.email || '-'}</td>
                        <td>{p.phone || '-'}</td>
                        <td>{p.department}</td>
                        <td>
                          <span className={`${styles.badge} ${p.paymentStatus === 'Paid' ? styles.badgeSuccess : styles.badgeWarning}`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${p.entryStatus === 'ENTERED' ? styles.badgePrimary : styles.badgeNeutral}`}>
                            {p.entryStatus}
                          </span>
                        </td>
                        <td className={styles.time}>
                          {p.entryTimestamp ? new Date(p.entryTimestamp).toLocaleString() : '-'}
                        </td>
                        <td>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className={styles.noData}>No participants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(page - 1) * 20 + (participants.length > 0 ? 1 : 0)} - {Math.min(page * 20, total)} of {total} participants
            </span>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className={styles.pageDisplay}>{page} / {totalPages || 1}</span>
              <button 
                className={styles.pageBtn} 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
