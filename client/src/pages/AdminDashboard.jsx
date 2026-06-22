import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Settings, Users, FileQuestion, GraduationCap, UploadCloud, Plus, Edit, Trash, Search, RefreshCw, X } from 'lucide-react';

export const AdminDashboard = () => {
  const { apiUrl, showToast } = useAuth();
  
  // Dashboard overall stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Question lists & search filters
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Active form management: 'list' | 'add' | 'edit'
  const [activeView, setActiveView] = useState('list');
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    subject: 'HTML',
    topic: '',
    questionType: 'MCQ',
    question: '',
    difficulty: 'Easy',
    explanation: '',
    // MCQ specific
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answer: '',
    // SPQ specific
    description: '',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    constraints: '',
    starterCode: '',
    solution: '',
    testCasesStr: '[\n  {"input": "sample_input", "output": "sample_output", "isHidden": false}\n]'
  });

  // Bulk Upload File
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Refresh Statistics & Activities
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${apiUrl}/results/admin/dashboard`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Refresh Questions list
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const queryParams = [];
      if (subjectFilter) queryParams.push(`subject=${subjectFilter}`);
      if (searchQuery) queryParams.push(`search=${searchQuery}`);
      
      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await axios.get(`${apiUrl}/questions${queryStr}`);
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter, searchQuery]);

  const handleResetForm = () => {
    setFormFields({
      subject: 'HTML',
      topic: '',
      questionType: 'MCQ',
      question: '',
      difficulty: 'Easy',
      explanation: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      answer: '',
      description: '',
      inputFormat: '',
      outputFormat: '',
      sampleInput: '',
      sampleOutput: '',
      constraints: '',
      starterCode: '',
      solution: '',
      testCasesStr: '[\n  {"input": "sample_input", "output": "sample_output", "isHidden": false}\n]'
    });
    setEditingQuestionId(null);
  };

  // Open Form for Adding
  const handleOpenAddForm = () => {
    handleResetForm();
    setActiveView('form');
  };

  // Open Form for Editing
  const handleOpenEditForm = (q) => {
    setEditingQuestionId(q._id);
    
    // Parse test cases back to string
    let testCasesString = '[]';
    if (q.testCases) {
      testCasesString = JSON.stringify(q.testCases, null, 2);
    }

    setFormFields({
      subject: q.subject,
      topic: q.topic,
      questionType: q.questionType,
      question: q.question,
      difficulty: q.difficulty || 'Easy',
      explanation: q.explanation || '',
      optionA: q.options?.[0] || '',
      optionB: q.options?.[1] || '',
      optionC: q.options?.[2] || '',
      optionD: q.options?.[3] || '',
      answer: q.answer || '',
      description: q.description || '',
      inputFormat: q.inputFormat || '',
      outputFormat: q.outputFormat || '',
      sampleInput: q.sampleInput || '',
      sampleOutput: q.sampleOutput || '',
      constraints: q.constraints || '',
      starterCode: q.starterCode || '',
      solution: q.solution || '',
      testCasesStr: testCasesString
    });

    setActiveView('form');
  };

  const handleFieldChange = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Structure payload based on type
    const payload = {
      subject: formFields.subject,
      topic: formFields.topic,
      questionType: formFields.questionType,
      question: formFields.question,
      difficulty: formFields.difficulty,
      explanation: formFields.explanation,
    };

    if (formFields.questionType === 'MCQ') {
      payload.options = [formFields.optionA, formFields.optionB, formFields.optionC, formFields.optionD];
      payload.answer = formFields.answer;
    } else {
      payload.description = formFields.description;
      payload.inputFormat = formFields.inputFormat;
      payload.outputFormat = formFields.outputFormat;
      payload.sampleInput = formFields.sampleInput;
      payload.sampleOutput = formFields.sampleOutput;
      payload.constraints = formFields.constraints;
      payload.starterCode = formFields.starterCode;
      payload.solution = formFields.solution;
      
      try {
        payload.testCases = JSON.parse(formFields.testCasesStr);
      } catch (err) {
        showToast('Malformed JSON array inside testCases fields. Make sure it is valid JSON.', 'error');
        return;
      }
    }

    try {
      let res;
      if (editingQuestionId) {
        res = await axios.put(`${apiUrl}/questions/${editingQuestionId}`, payload);
      } else {
        res = await axios.post(`${apiUrl}/questions`, payload);
      }

      if (res.data.success) {
        showToast(editingQuestionId ? 'Question updated successfully!' : 'Question added successfully!');
        setActiveView('list');
        fetchQuestions();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error processing question', 'error');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (window.confirm('Delete this question permanently?')) {
      try {
        const res = await axios.delete(`${apiUrl}/questions/${qId}`);
        if (res.data.success) {
          showToast('Question deleted.');
          fetchQuestions();
          fetchStats();
        }
      } catch (err) {
        console.error(err);
        showToast('Delete request failed', 'error');
      }
    }
  };

  // Bulk Upload File handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const res = await axios.post(`${apiUrl}/questions/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast(res.data.message || 'Bulk import successful!');
        setSelectedFile(null);
        fetchQuestions();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Bulk upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '50px' }}>
      
      {/* Page Title */}
      <div className="glass" style={{ padding: '24px 32px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Settings size={28} color="var(--color-secondary)" />
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Mentor Control Room</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Manage curriculum assessments, track student metrics, and seed exam databases.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {loadingStats ? (
        <LoadingSkeleton type="list" count={1} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="glass" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Users size={24} color="#38bdf8" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL STUDENTS</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats?.totalStudents || 0}</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FileQuestion size={24} color="#c084fc" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL QUESTIONS</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats?.totalQuestions || 0}</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GraduationCap size={24} color="#10b981" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TESTS GRADED</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats?.totalTests || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Primary Workspace split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left/Main Column: Manage Questions */}
        <div className="glass" style={{ padding: '24px', minWidth: '60%' }}>
          
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Question Bank Manager</h3>
            
            {activeView === 'list' ? (
              <button onClick={handleOpenAddForm} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Plus size={16} /> Add Question
              </button>
            ) : (
              <button onClick={() => setActiveView('list')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <X size={16} /> Close Form
              </button>
            )}
          </div>

          {/* 1. LIST VIEW */}
          {activeView === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Filter controls */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search question prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'rgba(0,0,0,0.2)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Subject filter */}
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="">All Subjects</option>
                  <option value="HTML">HTML</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Java">Java</option>
                  <option value="Unix">Unix</option>
                  <option value="SQL">SQL</option>
                  <option value="PL SQL">PL SQL</option>
                </select>
              </div>

              {/* Questions table list */}
              {loadingQuestions ? (
                <LoadingSkeleton type="list" count={1} />
              ) : questions.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching questions found in DB.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                        <th style={{ padding: '12px 8px' }}>SUBJECT</th>
                        <th style={{ padding: '12px 8px' }}>TYPE</th>
                        <th style={{ padding: '12px 8px' }}>PROMPT</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q) => (
                        <tr key={q._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12.5px' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
                              {q.subject}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, background: q.questionType === 'SPQ' ? 'rgba(168,85,247,0.1)' : 'rgba(16,185,129,0.1)', color: q.questionType === 'SPQ' ? '#c084fc' : '#10b981', padding: '2px 6px', borderRadius: '4px' }}>
                              {q.questionType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.question}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => handleOpenEditForm(q)}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q._id)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. FORM VIEW (Add or Edit) */}
          {activeView === 'form' && (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Form config row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SUBJECT</label>
                  <select name="subject" value={formFields.subject} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#090d16', color: '#ffffff' }}>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="Unix">Unix</option>
                    <option value="SQL">SQL</option>
                    <option value="PL SQL">PL SQL</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>QUESTION TYPE</label>
                  <select name="questionType" value={formFields.questionType} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#090d16', color: '#ffffff' }}>
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="SPQ">SPQ (Hands-on Code)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DIFFICULTY</label>
                  <select name="difficulty" value={formFields.difficulty} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#090d16', color: '#ffffff' }}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Topic & Prompt */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOPIC</label>
                  <input type="text" name="topic" placeholder="e.g. Loops, Box Model" value={formFields.topic} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>QUESTION / TITLE</label>
                  <input type="text" name="question" placeholder="Question prompt or SPQ title" value={formFields.question} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                </div>
              </div>

              {/* MCQ Fields */}
              {formFields.questionType === 'MCQ' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>MCQ SPECIFIC CONFIGURATION</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" name="optionA" placeholder="Option A" value={formFields.optionA} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                    <input type="text" name="optionB" placeholder="Option B" value={formFields.optionB} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                    <input type="text" name="optionC" placeholder="Option C" value={formFields.optionC} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                    <input type="text" name="optionD" placeholder="Option D" value={formFields.optionD} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CORRECT ANSWER</label>
                    <input type="text" name="answer" placeholder="Must match the exact text of one of the options above" value={formFields.answer} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                  </div>
                </div>
              )}

              {/* SPQ Fields */}
              {formFields.questionType === 'SPQ' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc' }}>SPQ CODES & DESCRIPTIONS</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESCRIPTION (Markdown support)</label>
                    <textarea name="description" placeholder="Markdown text with examples, guidelines..." value={formFields.description} onChange={handleFieldChange} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff', minHeight: '100px', resize: 'vertical', fontFamily: 'var(--font-body)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" name="inputFormat" placeholder="Input format description" value={formFields.inputFormat} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                    <input type="text" name="outputFormat" placeholder="Output format description" value={formFields.outputFormat} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" name="sampleInput" placeholder="Sample Input data" value={formFields.sampleInput} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                    <input type="text" name="sampleOutput" placeholder="Sample Output data" value={formFields.sampleOutput} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />
                  </div>

                  <input type="text" name="constraints" placeholder="Constraints description" value={formFields.constraints} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STARTER CODE</label>
                    <textarea name="starterCode" placeholder="Code template for trainees..." value={formFields.starterCode} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff', height: '100px', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CORRECT SOLUTION CODE</label>
                    <textarea name="solution" placeholder="Reference answer..." value={formFields.solution} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff', height: '100px', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TEST CASES JSON ARRAY (Hidden + Visible)</label>
                    <textarea name="testCasesStr" placeholder="JSON Array of [{input, output, isHidden}]" value={formFields.testCasesStr} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff', height: '100px', fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>
              )}

              {/* Explanation (Common) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EXPLANATION</label>
                <textarea name="explanation" placeholder="Detailed solution guidelines..." value={formFields.explanation} onChange={handleFieldChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: '#ffffff', height: '80px' }} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveView('list')} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Column: Bulk import + Recent activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', minWidth: '35%' }}>
          
          {/* CSV Upload Area */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={18} color="var(--color-primary)" />
              Bulk Question Import
            </h3>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              Upload a `.json` question array, or a `.csv` database sheet. Ensure files align with standard template layouts.
            </p>

            <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  border: '2px dashed var(--card-border)',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: selectedFile ? 'rgba(56, 189, 248, 0.04)' : 'rgba(0,0,0,0.1)'
                }}
                onClick={() => document.getElementById('file-picker').click()}
              >
                <input
                  id="file-picker"
                  type="file"
                  accept=".csv,.json"
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <Plus size={24} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: selectedFile ? '#ffffff' : 'var(--text-muted)' }}>
                  {selectedFile ? selectedFile.name : 'Select JSON/CSV File'}
                </span>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="btn-primary"
                style={{ padding: '10px', fontSize: '13.5px', justifyContent: 'center', width: '100%' }}
              >
                {uploading ? 'Processing Database Upload...' : 'Upload Database File'}
              </button>
            </form>
          </div>

          {/* Recent Trainee Graded Logs */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} color="var(--color-secondary)" />
              Recent Trainee Submissions
            </h3>

            {loadingStats ? (
              <LoadingSkeleton type="list" count={1} />
            ) : !stats?.recentActivities || stats.recentActivities.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                No active trainee records graded.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.recentActivities.map((act) => (
                  <div
                    key={act._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12.5px'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#ffffff' }}>{act.studentName}</strong>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {act.subject} Mock • {act.testType}
                      </p>
                    </div>
                    <span style={{ fontWeight: 800, color: act.score >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {act.score} Pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
