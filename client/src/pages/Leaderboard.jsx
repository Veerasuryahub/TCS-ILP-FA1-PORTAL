import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Trophy, Flame, Sparkles, Award } from 'lucide-react';

export const Leaderboard = () => {
  const { apiUrl } = useAuth();
  const [rankings, setRankings] = useState({ overall: [], weekly: [] });
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 'weekly'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/leaderboard`);
        if (res.data.success) {
          setRankings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [apiUrl]);

  if (loading) return <LoadingSkeleton type="dashboard" />;

  const activeRankings = rankings[activeTab] || [];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Title */}
      <div className="glass" style={{ padding: '32px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            height: '56px',
            width: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)'
          }}
        >
          <Trophy size={28} color="#ffffff" />
        </div>
        
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Trainee Leaderboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Compete with other TCS ILP trainees. Complete mock assessments and maintain streaks to climb higher!
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('overall')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: activeTab === 'overall' ? '1px solid var(--color-primary)' : '1px solid var(--card-border)',
            background: activeTab === 'overall' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
            color: activeTab === 'overall' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          All-Time Standings
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: activeTab === 'weekly' ? '1px solid var(--color-primary)' : '1px solid var(--card-border)',
            background: activeTab === 'weekly' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
            color: activeTab === 'weekly' ? '#ffffff' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          Weekly Sprint
        </button>
      </div>

      {/* Standings Table Card */}
      <div className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
        {activeRankings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No trainee score data accumulated for this sprint.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <th style={{ padding: '16px' }}>RANK</th>
                <th style={{ padding: '16px' }}>TRAINEE</th>
                <th style={{ padding: '16px' }}>COLLEGE / ACADEMY</th>
                <th style={{ padding: '16px' }}>DAILY STREAK</th>
                <th style={{ padding: '16px' }}>TESTS COMPLETED</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>TOTAL POINTS</th>
              </tr>
            </thead>
            <tbody>
              {activeRankings.map((row) => {
                const isTop3 = row.rank <= 3;
                let rowBg = 'transparent';
                if (row.rank === 1) rowBg = 'rgba(245, 158, 11, 0.03)';
                else if (row.rank === 2) rowBg = 'rgba(255, 255, 255, 0.01)';
                
                return (
                  <tr
                    key={row.userId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: rowBg,
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = rowBg;
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: row.rank === 1 ? '#f59e0b' : row.rank === 2 ? '#cbd5e1' : row.rank === 3 ? '#b45309' : 'rgba(255,255,255,0.05)',
                          color: isTop3 ? '#000000' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                      >
                        {row.rank}
                      </span>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{row.name}</span>
                        {row.badges && row.badges.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {row.badges.slice(-1).map((b, idx) => (
                              <span key={idx} style={{ fontSize: '9px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '1px 4px', borderRadius: '4px' }}>
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* College */}
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{row.college}</td>

                    {/* Streak */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600 }}>
                        <Flame size={16} fill="#f59e0b" />
                        <span>{row.streak} Days</span>
                      </div>
                    </td>

                    {/* Tests Taken */}
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{row.testsTaken} Tests</td>

                    {/* Score */}
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>
                      <span className={row.rank === 1 ? 'text-gradient' : ''} style={{ color: row.rank === 1 ? 'transparent' : '#ffffff' }}>
                        {row.totalScore} Pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Leaderboard;
