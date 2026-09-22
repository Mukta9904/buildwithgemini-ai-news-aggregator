'use client';

import { useState, useEffect } from 'react';

type Digest = {
  id: number;
  created_at: string;
  status: string;
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [digests, setDigests] = useState<Digest[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchDigests();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.targetEmail) {
        setEmail(data.targetEmail);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDigests = async () => {
    try {
      const res = await fetch('/api/digests');
      const data = await res.json();
      if (data.digests) {
        setDigests(data.digests);
      }
    } catch (err) {
      console.error('Failed to load digests', err);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: email }),
      });
      
      if (res.ok) {
        setMessage('Email settings saved successfully.');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTriggerRun = async () => {
    setTriggering(true);
    setMessage('Running pipeline... this may take a minute.');
    
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }), // Add token if auth is enabled
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || 'Pipeline executed successfully.');
        fetchDigests(); // Refresh history
      } else {
        setMessage(data.error || 'Pipeline execution failed.');
      }
    } catch (err) {
      setMessage('Error triggering pipeline.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="container">
      <header className="header animate-fade-in">
        <h1 className="title">AI Daily Digest</h1>
        <p className="subtitle">Automated GenAI, RAG, and MCP News Aggregator</p>
      </header>

      <main>
        <section className="card animate-fade-in delay-1">
          <h2 className="card-title">Configuration</h2>
          <form onSubmit={handleSaveEmail}>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Target Email Address</label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button type="submit" className="btn" disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              
              {message && (
                <span style={{ fontSize: '0.9rem', color: message.includes('failed') || message.includes('Error') ? '#f87171' : '#4ade80' }}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </section>

        <section className="card animate-fade-in delay-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="card-title" style={{ margin: 0 }}>Manual Trigger</h2>
            <button 
              className="btn" 
              onClick={handleTriggerRun} 
              disabled={triggering || !email}
              style={{ background: triggering ? '#475569' : '#10b981' }}
            >
              {triggering ? 'Running Pipeline...' : 'Run Pipeline Now'}
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            The pipeline is scheduled to run automatically at 7:00 AM and 7:45 PM. 
            You can manually trigger it here for testing. Ensure your SMTP settings are configured in <code>.env.local</code>.
          </p>
        </section>

        <section className="card animate-fade-in delay-3">
          <h2 className="card-title">Recent History</h2>
          
          {digests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No digests have been generated yet.</p>
          ) : (
            <div>
              {digests.map((digest) => (
                <div key={digest.id} className="history-item">
                  <div className="history-meta">
                    <span>{new Date(digest.created_at).toLocaleString()}</span>
                    <span className={`status-badge status-${digest.status}`}>
                      {digest.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Digest #{digest.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
