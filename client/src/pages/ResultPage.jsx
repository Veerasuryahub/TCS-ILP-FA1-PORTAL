import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Award, CheckCircle2, XCircle, ArrowLeft, Printer, RefreshCw } from 'lucide-react';

export const ResultPage = () => {
  const { id } = useParams();
  const { apiUrl, showToast } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/test/result/${id}`);
        if (res.data.success) {
          setResult(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching result details', err);
        showToast('Error loading result report', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, apiUrl]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!result) return <div style={{ padding: '40px', textAlign: 'center' }}>Result report not found.</div>;

  // Calculate Accuracy
  const total = result.correct + result.wrong;
  const accuracy = total > 0 ? Math.round((result.correct / total) * 100) : 0;

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '50px' }}>
      
      {/* Top Action Row (Hidden on Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px', borderColor: '#002f6c', color: '#002f6c' }}
          >
            <Printer size={16} /> Export Report PDF
          </button>
          
          <button
            onClick={() => navigate(result.testType === 'SPQ' ? '/spq-practice' : '/mcq-practice')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '4px' }}
          >
            <RefreshCw size={16} /> Take Another Test
          </button>
        </div>
      </div>

      {/* Print only Header */}
      <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000000', paddingBottom: '16px' }}>
        <h2>TCS ILP - ASSESSMENT PERFORMANCE CARD</h2>
        <p style={{ marginTop: '6px' }}>Trainee Prep Portal for TCS ILP FA1</p>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Score Card */}
        <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              background: '#e7f1ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #b6d4fe'
            }}
          >
            <Award size={20} color="#002f6c" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>SCORE</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529', marginTop: '2px', marginBottom: 0 }}>{result.score} Pts</h3>
          </div>
        </div>

        {/* Correct Card */}
        <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              background: '#d1e7dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a3cfbb'
            }}
          >
            <CheckCircle2 size={20} color="#198754" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>CORRECT ANSWERS</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#198754', marginTop: '2px', marginBottom: 0 }}>{result.correct} / {result.totalQuestions}</h3>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              background: '#fff3cd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ffe69c'
            }}
          >
            <Award size={20} color="#664d03" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>ACCURACY RATE</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#664d03', marginTop: '2px', marginBottom: 0 }}>{accuracy}%</h3>
          </div>
        </div>

        {/* Time Spent Card */}
        <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              background: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ced4da'
            }}
          >
            <Printer size={20} color="#495057" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>TIME CONSUMED</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212529', marginTop: '2px', marginBottom: 0 }}>{formatTime(result.timeTaken)}</h3>
          </div>
        </div>

      </div>

      {/* Questions detailed breakdown review */}
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', marginBottom: '16px' }}>Detailed Question Analysis</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {result.answers.map((ans, idx) => {
          const q = ans.questionId;
          const isCorrect = ans.isCorrect;

          if (!q) return null;

          return (
            <div
              key={ans._id}
              className="glass"
              style={{
                padding: '20px',
                backgroundColor: '#ffffff',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                borderLeft: isCorrect ? '5px solid #198754' : '5px solid #dc3545'
              }}
            >
              {/* Question Index & Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6c757d' }}>
                    QUESTION {idx + 1} &raquo; {q.subject.toUpperCase()} ({q.topic.toUpperCase()})
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#212529', marginTop: '2px', marginBottom: 0, lineHeight: '1.4' }}>
                    {q.question}
                  </h4>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: isCorrect ? '#0f5132' : '#842029',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: isCorrect ? '#d1e7dd' : '#f8d7da',
                    border: `1px solid ${isCorrect ? '#a3cfbb' : '#f5c2c7'}`
                  }}
                >
                  {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span>{isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
                </div>
              </div>

              {/* MCQ Options Display */}
              {q.questionType === 'MCQ' && q.options && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', margin: '12px 0' }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = ans.userAnswer === opt;
                    const isCorrectOpt = ans.correctAnswer === opt;
                    
                    let optStyle = {
                      padding: '10px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      background: '#f8f9fa',
                      border: '1px solid #ced4da',
                      color: '#495057'
                    };

                    if (isCorrectOpt) {
                      optStyle.background = '#d1e7dd';
                      optStyle.border = '1px solid #a3cfbb';
                      optStyle.color = '#0f5132';
                    } else if (isSelected && !isCorrectOpt) {
                      optStyle.background = '#f8d7da';
                      optStyle.border = '1px solid #f5c2c7';
                      optStyle.color = '#842029';
                    }

                    return (
                      <div key={oIdx} style={optStyle}>
                        <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt} 
                        {isCorrectOpt && ' (Correct Answer)'} 
                        {isSelected && !isCorrectOpt && ' (Your Selection)'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SPQ Submissions Display */}
              {q.questionType === 'SPQ' && (
                <div style={{ margin: '12px 0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6c757d' }}>YOUR SUBMITTED CODE:</span>
                  <pre
                    style={{
                      background: '#212529',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12.5px',
                      color: '#ffffff',
                      overflowX: 'auto',
                      marginTop: '4px',
                      maxHeight: '200px'
                    }}
                  >
                    <code>{ans.userAnswer}</code>
                  </pre>
                </div>
              )}

              {/* Question Explanation */}
              <div
                style={{
                  background: '#e7f1ff',
                  border: '1px solid #b6d4fe',
                  borderRadius: '4px',
                  padding: '12px',
                  marginTop: '12px',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
              >
                <strong style={{ color: '#002f6c' }}>Explanation:</strong>
                <p style={{ marginTop: '4px', color: '#212529', whiteSpace: 'pre-line' }}>{ans.explanation}</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ResultPage;
