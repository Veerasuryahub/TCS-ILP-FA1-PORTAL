import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, Bookmark } from 'lucide-react';

export const MCQPractice = () => {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject') || '';
  
  const { apiUrl, showToast } = useAuth();
  const navigate = useNavigate();

  // Test setup states
  const [testStarted, setTestStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || 'HTML');
  const [testType, setTestType] = useState(subjectParam ? 'MCQ' : 'Full Mock');
  const [starting, setStarting] = useState(false);

  // Active test states
  const [testId, setTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // [{ questionId, answer, isFlagged }]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const timerRef = useRef(null);

  // Load subject names on setup
  const [subjectsList, setSubjectsList] = useState([]);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${apiUrl}/subjects`);
        if (res.data.success) {
          setSubjectsList(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, [apiUrl]);

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

  // Start Test
  const handleStartTest = async () => {
    try {
      setStarting(true);
      const res = await axios.post(`${apiUrl}/test/start`, {
        testType,
        subject: testType === 'Full Mock' ? 'Full Mock' : selectedSubject
      });

      if (res.data.success) {
        const testData = res.data.data;
        setTestId(testData.testId);
        setQuestions(testData.questions);
        
        // Match default answers
        setAnswers(testData.answers);
        setTimeLeft(testData.duration);
        setTestStarted(true);
        setCurrentIndex(0);
        showToast('Assessment started. Timer is now ticking!');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error starting assessment', 'error');
    } finally {
      setStarting(false);
    }
  };

  // Option select
  const handleSelectOption = (optionText) => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex ? { ...ans, answer: optionText } : ans
      )
    );
  };

  // Mark for review toggle
  const handleToggleFlag = () => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex ? { ...ans, isFlagged: !ans.isFlagged } : ans
      )
    );
  };

  // Clear current response
  const handleClearResponse = () => {
    setAnswers((prev) =>
      prev.map((ans, idx) =>
        idx === currentIndex ? { ...ans, answer: '' } : ans
      )
    );
  };

  // Save and go next
  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Auto Save/Submit
  const autoSubmit = async () => {
    showToast('Timer expired! Auto-submitting assessment...', 'warning');
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
        navigate(`/test/result/${res.data.resultId}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error submitting assessment', 'error');
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

  // Setup Portal View
  if (!testStarted) {
    return (
      <div className="fade-in" style={{ maxWidth: '600px', margin: '40px auto', paddingBottom: '40px' }}>
        <div className="glass" style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#002f6c', textAlign: 'center', marginBottom: '8px' }}>
            MCQ Assessment Hub
          </h2>
          <p style={{ color: '#6c757d', fontSize: '13.5px', textAlign: 'center', marginBottom: '24px' }}>
            Select your practice test parameters and start your timed session.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Assessment Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#212529' }}>ASSESSMENT TYPE</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => { setTestType('Full Mock'); setSelectedSubject('Full Mock'); }}
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    border: testType === 'Full Mock' ? '2px solid #002f6c' : '1px solid #ced4da',
                    background: testType === 'Full Mock' ? '#e7f1ff' : '#ffffff',
                    color: '#212529',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  Full Mock Exam
                  <p style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'normal', marginTop: '2px' }}>30 Questions • 30 mins</p>
                </button>

                <button
                  onClick={() => setTestType('MCQ')}
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    border: testType === 'MCQ' ? '2px solid #002f6c' : '1px solid #ced4da',
                    background: testType === 'MCQ' ? '#e7f1ff' : '#ffffff',
                    color: '#212529',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  Subject Practice
                  <p style={{ fontSize: '11px', color: '#6c757d', fontWeight: 'normal', marginTop: '2px' }}>15 Questions • 15 mins</p>
                </button>
              </div>
            </div>

            {/* Subject Selector */}
            {testType === 'MCQ' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#212529' }}>SELECT SUBJECT</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    background: '#ffffff',
                    color: '#212529',
                    outline: 'none',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  {subjectsList.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Instructions box */}
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
              <AlertTriangle size={18} color="#664d03" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Important Assessment Rules:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <li>Ensure a stable network connection before starting.</li>
                  <li>Clicking "Save & Next" updates your choice.</li>
                  <li>Timer cannot be paused once started.</li>
                </ul>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartTest}
              disabled={starting}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '15px', justifyContent: 'center', width: '100%', borderRadius: '4px' }}
            >
              {starting ? 'Generating Test Session...' : 'Start Assessment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Assessment layout (Standard Official Style)
  const currentQuestion = questions[currentIndex];
  const currentAnswerObj = answers[currentIndex] || {};
  const currentAnswer = currentAnswerObj.answer || '';
  const isFlagged = currentAnswerObj.isFlagged || false;

  const timerCritical = timeLeft < 300; // Under 5 minutes is critical

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', minHeight: 'calc(100vh - 160px)', paddingBottom: '20px' }}>
      
      {/* Question panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="glass" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dee2e6', paddingBottom: '12px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#002f6c' }}>
                {currentQuestion.subject.toUpperCase()} &raquo; {currentQuestion.topic.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#212529', marginTop: '2px', marginBottom: 0 }}>
                Question {currentIndex + 1} of {questions.length}
              </h3>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '4px',
                background: timerCritical ? '#f8d7da' : '#e2e3e5',
                border: `1px solid ${timerCritical ? '#f5c2c7' : '#dbdbdb'}`,
                color: timerCritical ? '#842029' : '#212529',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              <Clock size={14} />
              <span>TIME LEFT: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div style={{ fontSize: '15px', color: '#212529', fontWeight: '600', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
            {currentQuestion.question}
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
            {currentQuestion.options.map((opt, oIdx) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    border: isSelected ? '2px solid #002f6c' : '1px solid #ced4da',
                    background: isSelected ? '#e7f1ff' : '#ffffff',
                    color: '#212529',
                    cursor: 'pointer',
                    fontSize: '14.5px',
                    textAlign: 'left',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    transition: 'all 0.15s ease',
                    width: '100%'
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #002f6c' : '2px solid #6c757d',
                      display: 'inline-block',
                      flexShrink: 0
                    }}
                  />
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleToggleFlag}
              className="btn-secondary"
              style={{
                padding: '10px 16px',
                borderColor: isFlagged ? '#664d03' : '#ced4da',
                color: isFlagged ? '#664d03' : '#212529',
                background: isFlagged ? '#fff3cd' : '#f8f9fa',
                fontSize: '13px'
              }}
            >
              <Bookmark size={14} fill={isFlagged ? '#664d03' : 'none'} style={{ marginRight: '4px' }} />
              {isFlagged ? 'Flagged' : 'Flag for Review'}
            </button>
            
            <button
              onClick={handleClearResponse}
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '13px' }}
            >
              Clear Choice
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary"
              style={{ padding: '10px 14px' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={handleSaveAndNext}
              disabled={currentIndex === questions.length - 1}
              className="btn-primary"
              style={{ padding: '10px 20px', borderRadius: '4px' }}
            >
              Save & Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Palette / Submission Panel */}
      <div className="glass" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ced4da', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#002f6c', marginBottom: '15px', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>
            Navigation Palette
          </h3>

          {/* Grid Palette list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {questions.map((_, qIdx) => {
              const ansObj = answers[qIdx] || {};
              const isQAnswered = ansObj.answer !== '';
              const isQFlagged = ansObj.isFlagged;
              
              let circleColor = '#f8f9fa';
              let textColor = '#212529';
              let borderStyle = '1px solid #ced4da';

              if (currentIndex === qIdx) {
                borderStyle = '2px solid #002f6c';
              }

              if (isQFlagged) {
                circleColor = '#fff3cd';
                textColor = '#664d03';
                borderStyle = '1px solid #ffe69c';
                if (currentIndex === qIdx) borderStyle = '2px solid #664d03';
              } else if (isQAnswered) {
                circleColor = '#d1e7dd';
                textColor = '#0f5132';
                borderStyle = '1px solid #a3cfbb';
                if (currentIndex === qIdx) borderStyle = '2px solid #0f5132';
              }

              return (
                <button
                  key={qIdx}
                  onClick={() => setCurrentIndex(qIdx)}
                  style={{
                    height: '34px',
                    borderRadius: '4px',
                    background: circleColor,
                    color: textColor,
                    border: borderStyle,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#6c757d', borderTop: '1px solid #dee2e6', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#d1e7dd', border: '1px solid #a3cfbb' }} />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fff3cd', border: '1px solid #ffe69c' }} />
              <span>Flagged / Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f8f9fa', border: '1px solid #ced4da' }} />
              <span>Not Visited / Empty</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleManualSubmit}
          disabled={submitting}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', backgroundColor: '#198754', borderColor: '#198754', borderRadius: '4px', marginTop: '20px' }}
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
          {!submitting && <CheckCircle size={14} style={{ marginLeft: '6px' }} />}
        </button>
      </div>

      {/* Custom Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in glass" style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid #ced4da' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', marginBottom: '10px' }}>Submit Assessment?</h3>
            <p style={{ color: '#495057', fontSize: '14px', marginBottom: '20px' }}>
              {answers.filter(a => !a.answer).length > 0 
                ? `You have ${answers.filter(a => !a.answer).length} unanswered questions. Are you sure you want to submit?`
                : 'Are you sure you want to submit your assessment?'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowSubmitModal(false)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              <button onClick={confirmSubmit} className="btn-primary" style={{ padding: '10px 20px', background: '#198754', borderColor: '#198754' }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MCQPractice;
