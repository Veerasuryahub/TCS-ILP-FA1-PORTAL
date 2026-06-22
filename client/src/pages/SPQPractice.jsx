import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Clock, Play, ChevronLeft, ChevronRight, AlertCircle, Save, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';

export const SPQPractice = () => {
  const { apiUrl, showToast } = useAuth();
  const navigate = useNavigate();

  // Assessment flow states
  const [testStarted, setTestStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [testId, setTestId] = useState('');
  
  // Active questions and editor responses
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // [{ questionId, answer, isFlagged }]
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Execution Console states
  const [compiling, setCompiling] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [compilationError, setCompilationError] = useState('');
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);

  // Sync Timer
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, timeLeft]);

  // Start SPQ Assessment
  const handleStartSPQ = async () => {
    try {
      setStarting(true);
      const res = await axios.post(`${apiUrl}/test/start`, {
        testType: 'SPQ',
        subject: 'SPQ Arena'
      });

      if (res.data.success) {
        const testData = res.data.data;
        setTestId(testData.testId);
        setQuestions(testData.questions);
        
        // Initialize answer array with starter codes
        const initialAnswers = testData.questions.map(q => ({
          questionId: q._id,
          answer: q.starterCode || '',
          isFlagged: false
        }));
        
        // Load any cached codes from localStorage
        const cached = localStorage.getItem(`spq_cache_${testData.testId}`);
        if (cached) {
          try {
            setAnswers(JSON.parse(cached));
          } catch(e) {
            setAnswers(initialAnswers);
          }
        } else {
          setAnswers(initialAnswers);
        }

        setTimeLeft(testData.duration);
        setTestStarted(true);
        setCurrentIndex(0);
        setCompilationError('');
        setTestCaseResults([]);
        setActiveTestCaseTab(0);
        showToast('Hands-On Code Arena launched. Timer is ticking!');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error launching arena', 'error');
    } finally {
      setStarting(false);
    }
  };

  // Keep localStorage backup of code
  const handleCodeChange = (newCode) => {
    const updatedAnswers = answers.map((ans, idx) =>
      idx === currentIndex ? { ...ans, answer: newCode } : ans
    );
    setAnswers(updatedAnswers);
    if (testId) {
      localStorage.setItem(`spq_cache_${testId}`, JSON.stringify(updatedAnswers));
    }
  };

  // Compile and run against sample test cases
  const handleRunCode = async () => {
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentIndex]?.answer || '';

    try {
      setCompiling(true);
      setCompilationError('');
      setTestCaseResults([]);

      const res = await axios.post(`${apiUrl}/test/run-spq`, {
        questionId: currentQ._id,
        code: currentAns
      });

      if (res.data.success) {
        const runData = res.data.data;
        if (runData.success === false && runData.errorType === 'compilation') {
          setCompilationError(runData.error);
          showToast('Compilation Failed!', 'error');
        } else {
          setTestCaseResults(runData.results || []);
          setActiveTestCaseTab(0);
          const allPassed = runData.results.every(r => r.passed);
          
          if (allPassed) {
            showToast('All Sample Test Cases Passed!');
          } else {
            showToast('Some test cases failed.', 'warning');
          }
        }
      }
    } catch (err) {
      console.error(err);
      setCompilationError(err.response?.data?.message || err.message);
      showToast('Error executing program', 'error');
    } finally {
      setCompiling(false);
    }
  };

  // Submit test
  const autoSubmit = async () => {
    showToast('Assessment time expired! Compiling results...', 'warning');
    await executeSubmission();
  };

  const handleManualSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    executeSubmission();
  };

  const executeSubmission = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      setSubmitting(true);
      const res = await axios.post(`${apiUrl}/test/submit`, {
        testId,
        answers,
        timeSpent
      });

      if (res.data.success) {
        showToast('Assessment submitted successfully!');
        if (testId) {
          localStorage.removeItem(`spq_cache_${testId}`);
        }
        navigate(`/test/result/${res.data.resultId}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error submitting code solutions', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // 1. Setup Lobby View
  if (!testStarted) {
    return (
      <div className="fade-in" style={{ maxWidth: '600px', margin: '40px auto', paddingBottom: '40px' }}>
        <div className="glass" style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#002f6c', textAlign: 'center', marginBottom: '8px' }}>
            Hands-On Coding Arena
          </h2>
          <p style={{ color: '#6c757d', fontSize: '13.5px', textAlign: 'center', marginBottom: '24px' }}>
            Prepare for Section 1 SPQs. Write Java OOP/Problem Solving programs and Unix Shell Commands.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#212529', margin: 0 }}>Arena Configuration:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#495057' }}>
                <div>⏱️ <strong>Duration:</strong> 60 Minutes</div>
                <div>📝 <strong>Questions:</strong> 3 SPQs</div>
                <div>☕ <strong>Q1 & Q2:</strong> Java JDK 17</div>
                <div>🐚 <strong>Q3:</strong> Unix Command Pipeline</div>
              </div>
            </div>

            <div
              style={{
                background: '#fff3cd',
                border: '1px solid #ffe69c',
                borderRadius: '4px',
                padding: '12px 16px',
                display: 'flex',
                gap: '10px',
                fontSize: '13px',
                color: '#664d03',
                lineHeight: '1.5'
              }}
            >
              <AlertCircle size={18} color="#664d03" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Important Coding Portal Rules:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <li>Your code is periodically saved to local cache.</li>
                  <li>Click <strong>Run Code</strong> to execute your code against visible cases.</li>
                  <li>Final grading runs against <strong>hidden test cases</strong>.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleStartSPQ}
              disabled={starting}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '15px', justifyContent: 'center', width: '100%', borderRadius: '4px' }}
            >
              {starting ? 'Launching Assessment Portal...' : 'Enter Code Arena'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Coding Layout (Standard Split Screen)
  const currentQ = questions[currentIndex];
  const currentCode = answers[currentIndex]?.answer || '';
  const timerCritical = timeLeft < 600; // Under 10 minutes turns red

  return (
    <>
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '16px', paddingBottom: '10px' }}>
      
      {/* Top Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {questions.map((q, idx) => (
            <button
              key={q._id}
              onClick={() => {
                setCurrentIndex(idx);
                setCompilationError('');
                setTestCaseResults([]);
                setActiveTestCaseTab(0);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: idx === currentIndex ? '2px solid #002f6c' : '1px solid #ced4da',
                background: idx === currentIndex ? '#e7f1ff' : '#ffffff',
                color: '#212529',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              Question {idx + 1} ({q.subject})
            </button>
          ))}
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              background: timerCritical ? '#f8d7da' : '#e2e3e5',
              border: `1px solid ${timerCritical ? '#f5c2c7' : '#dbdbdb'}`,
              color: timerCritical ? '#842029' : '#212529',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            <Clock size={14} />
            <span>TIME LEFT: {formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={submitting}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13.5px',
              background: '#198754',
              borderColor: '#198754',
              borderRadius: '4px'
            }}
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Dual Pane split screen layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '20px', flexGrow: 1, minHeight: 0 }}>
        
        {/* Left Pane: Question Details & Samples */}
        <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#002f6c' }}>
              SECTION 1 &raquo; QUESTION {currentIndex + 1}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#212529', marginTop: '2px', marginBottom: '8px' }}>{currentQ.question}</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#f8f9fa', border: '1px solid #ced4da', padding: '2px 8px', borderRadius: '3px', color: '#495057' }}>
                Topic: {currentQ.topic}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#e7f1ff', border: '1px solid #b6d4fe', padding: '2px 8px', borderRadius: '3px', color: '#002f6c' }}>
                Difficulty: {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '13.5px',
              lineHeight: '1.5',
              color: '#212529',
              whiteSpace: 'pre-wrap',
              borderTop: '1px solid #dee2e6',
              paddingTop: '12px'
            }}
          >
            {/* Minimal markdown rendering */}
            {currentQ.description.split('\n\n').map((para, pIdx) => {
              if (para.startsWith('###')) {
                return <h3 key={pIdx} style={{ fontSize: '14px', fontWeight: 'bold', color: '#002f6c', marginTop: '10px', marginBottom: '6px' }}>{para.replace('###', '').trim()}</h3>;
              }
              if (para.startsWith('```') && para.endsWith('```')) {
                return (
                  <pre key={pIdx} style={{ background: '#f8f9fa', padding: '10px 14px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: 'var(--font-mono)', fontSize: '12.5px', overflowX: 'auto', margin: '8px 0', color: '#212529' }}>
                    <code>{para.replace(/```[a-z]*/g, '').trim()}</code>
                  </pre>
                );
              }
              return <p key={pIdx} style={{ marginBottom: '8px' }}>{para}</p>;
            })}
          </div>

          {/* Formats and constraints */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #dee2e6', paddingTop: '12px', fontSize: '13px' }}>
            {currentQ.inputFormat && (
              <div>
                <strong>Input Format:</strong>
                <p style={{ color: '#495057', marginTop: '2px' }}>{currentQ.inputFormat}</p>
              </div>
            )}
            {currentQ.outputFormat && (
              <div>
                <strong>Output Format:</strong>
                <p style={{ color: '#495057', marginTop: '2px' }}>{currentQ.outputFormat}</p>
              </div>
            )}
            {currentQ.constraints && (
              <div>
                <strong>Constraints:</strong>
                <pre style={{ color: '#dc3545', marginTop: '2px', fontFamily: 'var(--font-mono)', fontSize: '12px', background: '#fdf2f2', border: '1px solid #f5c2c7', padding: '6px 10px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>{currentQ.constraints}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor + Output Logger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: 0 }}>
          
          {/* Code Editor Container */}
          <div className="glass" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px' }}>
            <div
              style={{
                padding: '8px 14px',
                background: '#f8f9fa',
                borderBottom: '1px solid #ced4da',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#495057', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={14} /> SOLUTION SOURCE CODE EDITOR ({currentQ.subject === 'Java' ? 'Java 17' : 'Unix shell'})
              </span>
              <span style={{ fontSize: '11px', color: '#198754', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                <Save size={12} /> Auto-saves enabled
              </span>
            </div>

            <div style={{ flexGrow: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                language={currentQ.subject === 'Java' ? 'java' : 'shell'}
                theme="light"
                value={currentCode}
                onChange={(value) => handleCodeChange(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  padding: { top: 12 },
                }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRunCode}
              disabled={compiling}
              className="btn-secondary"
              style={{ flexGrow: 1, justifyContent: 'center', padding: '10px', borderRadius: '4px', fontWeight: 'bold' }}
            >
              <Play size={14} fill="#212529" style={{ marginRight: '6px' }} />
              {compiling ? 'Executing Code...' : 'Run Code against Sample Cases'}
            </button>
          </div>

          {/* Hackerrank-style Console logger */}
          <div
            style={{
              height: '240px',
              background: '#ffffff',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            {/* Header / Tabs */}
            <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #ced4da' }}>
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: '#495057', borderRight: '1px solid #ced4da', display: 'flex', alignItems: 'center' }}>
                EXECUTION RESULTS
              </div>
              
              {testCaseResults.length > 0 && !compilationError && (
                <div style={{ display: 'flex', overflowX: 'auto', flexGrow: 1 }}>
                  {testCaseResults.map((tc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCaseTab(idx)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: activeTestCaseTab === idx ? '#ffffff' : 'transparent',
                        borderBottom: activeTestCaseTab === idx ? '2px solid #002f6c' : '2px solid transparent',
                        color: tc.passed ? '#198754' : '#dc3545',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Test Case {idx + 1} {tc.passed ? '✅' : '❌'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
              {compilationError ? (
                <div>
                  <h4 style={{ color: '#dc3545', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Compilation Error</h4>
                  <pre style={{ background: '#fdf2f2', color: '#842029', padding: '10px', borderRadius: '4px', border: '1px solid #f5c2c7', fontSize: '12.5px', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {compilationError}
                  </pre>
                </div>
              ) : testCaseResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {testCaseResults[activeTestCaseTab]?.error && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '4px' }}>Execution Error</h4>
                      <pre style={{ background: '#f8d7da', padding: '8px', borderRadius: '4px', border: '1px solid #f5c2c7', fontSize: '12px', fontFamily: 'var(--font-mono)', margin: 0 }}>
                        {testCaseResults[activeTestCaseTab].error}
                      </pre>
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '4px' }}>Input</h4>
                    <pre style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '12px', fontFamily: 'var(--font-mono)', margin: 0 }}>
                      {testCaseResults[activeTestCaseTab]?.input || 'No input'}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '4px' }}>Expected Output</h4>
                    <pre style={{ background: '#f8f9fa', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '12px', fontFamily: 'var(--font-mono)', margin: 0 }}>
                      {testCaseResults[activeTestCaseTab]?.expected || 'Empty output'}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '4px' }}>Your Output</h4>
                    <pre style={{ background: testCaseResults[activeTestCaseTab]?.passed ? '#d1e7dd' : '#f8d7da', padding: '8px', borderRadius: '4px', border: testCaseResults[activeTestCaseTab]?.passed ? '1px solid #a3cfbb' : '1px solid #f5c2c7', fontSize: '12px', fontFamily: 'var(--font-mono)', margin: 0 }}>
                      {testCaseResults[activeTestCaseTab]?.actual || 'Empty output'}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#6c757d', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Run your code to see the test case results here.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>

      {/* Custom Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in glass" style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid #ced4da' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', marginBottom: '10px' }}>Submit Assessment?</h3>
            <p style={{ color: '#495057', fontSize: '14px', marginBottom: '20px' }}>
              Are you sure you want to end the coding test? This will execute your solutions against the hidden evaluation test cases.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowSubmitModal(false)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              <button onClick={confirmSubmit} className="btn-primary" style={{ padding: '10px 20px', background: '#198754', borderColor: '#198754' }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SPQPractice;
