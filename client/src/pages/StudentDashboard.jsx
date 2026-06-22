import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { FileText, Code, Clock, Info } from 'lucide-react';

export const StudentDashboard = () => {
  const { user, apiUrl } = useAuth();
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/results`);
        if (res.data.success) {
          setRecentTests(res.data.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard content', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiUrl]);

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* Official Gov-style Announcement Banner */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ced4da',
          borderLeft: '5px solid #002f6c',
          padding: '16px 20px',
          borderRadius: '4px',
          display: 'flex',
          gap: '12px',
          alignItems: 'start'
        }}
      >
        <Info size={20} color="#002f6c" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#002f6c', margin: 0 }}>
            TCS ILP TRAINEE INSTRUCTIONS
          </h3>
          <p style={{ color: '#495057', fontSize: '13px', margin: '4px 0 0 0', lineHeight: '1.5' }}>
            Welcome to the FA1 Preparation Portal. Use this dashboard to practice coding challenges (SPQ) and multiple-choice questions (MCQ). All assessment items are designed according to the official TCS ILP FA1 syllabus.
          </p>
        </div>
      </div>

      {/* Main Two Sections: MCQ & SPQ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* MCQ Practice Box */}
        <div
          className="glass"
          style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FileText size={24} color="#002f6c" />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', margin: 0 }}>
                Section 1: MCQ Practice Zone
              </h2>
            </div>
            <p style={{ color: '#495057', fontSize: '13.5px', lineHeight: '1.6' }}>
              Practice mock tests with multiple choice questions covering HTML, CSS, JavaScript, Java, Unix, SQL, and PL/SQL. Each quiz provides explanation for the answers to help clarify core programming concepts.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/mcq-practice')}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '12px'
            }}
          >
            Start MCQ Test
          </button>
        </div>

        {/* SPQ Coding Arena */}
        <div
          className="glass"
          style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Code size={24} color="#002f6c" />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', margin: 0 }}>
                Section 2: SPQ Coding Arena
              </h2>
            </div>
            <p style={{ color: '#495057', fontSize: '13.5px', lineHeight: '1.6' }}>
              Hands-on programming challenges for Java and Unix shell. Write code directly in the online environment, execute your scripts against predefined inputs, and compile with instant test case validations.
            </p>
          </div>

          <button
            onClick={() => navigate('/spq-practice')}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '12px'
            }}
          >
            Launch Coding Arena
          </button>
        </div>

      </div>

      {/* Trainee History Table */}
      <div
        className="glass"
        style={{
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          border: '1px solid #ced4da',
          borderRadius: '4px'
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#002f6c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#002f6c" />
          Your Recent Practice Submissions
        </h3>

        {recentTests.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
            No recent submissions found. Select MCQ or SPQ above to start practicing.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                  <th style={{ padding: '10px 8px' }}>Date</th>
                  <th style={{ padding: '10px 8px' }}>Topic / Subject</th>
                  <th style={{ padding: '10px 8px' }}>Type</th>
                  <th style={{ padding: '10px 8px' }}>Score</th>
                  <th style={{ padding: '10px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((test) => (
                  <tr key={test._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px 8px', color: '#6c757d' }}>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                      {test.subject}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {test.testType}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: test.score >= 70 ? '#198754' : '#6c757d' }}>
                      {test.score} Pts ({test.correct}/{test.totalQuestions})
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link
                        to={`/test/result/${test._id}`}
                        style={{ color: '#002f6c', fontWeight: 'bold', textDecoration: 'underline' }}
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;
