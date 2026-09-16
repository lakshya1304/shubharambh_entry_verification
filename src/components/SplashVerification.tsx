"use client";

import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";

const TARGET_HASH = "7bebe75464718bb6e6bad697e510c6a20c7ba85fbcf15326dc6af6d4df4ea6d2";

async function hashString(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export function SplashVerification({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const authStatus = sessionStorage.getItem("app_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(false);

    try {
      const hash = await hashString(password);
      if (hash === TARGET_HASH) {
        sessionStorage.setItem("app_authenticated", "true");
        setIsAuthenticated(true);
      } else {
        setError(true);
        setPassword("");
      }
    } catch (err) {
      console.error("Hashing failed", err);
      setError(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isMounted) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div className="glass-card" style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div className="neon-border" style={{ padding: "16px", borderRadius: "50%" }}>
            <Lock size={32} color="var(--primary)" />
          </div>
        </div>
        <h1 className="neon-text" style={{ fontSize: "24px", marginBottom: "8px" }}>
          Shubharambh 2.0
        </h1>
        <p style={{ color: "#a1a1aa", marginBottom: "24px", fontSize: "14px" }}>
          Enter password to access the entry management system.
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          {error && <p style={{ color: "var(--error)", fontSize: "14px" }}>Incorrect password. Please try again.</p>}
          <button type="submit" className="btn-primary" disabled={isChecking}>
            {isChecking ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
