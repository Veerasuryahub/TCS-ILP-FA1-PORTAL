import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { ArrowLeft, BookOpen, Clock, Play, GraduationCap, ChevronRight } from 'lucide-react';

export const SubjectDetail = () => {
  const { id } = useParams();
  const { apiUrl, showToast } = useAuth();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/subjects/${id}`);
        if (res.data.success) {
          setSubject(res.data.data);
          if (res.data.data.topics && res.data.data.topics.length > 0) {
            setSelectedTopic(res.data.data.topics[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching subject details', err);
        showToast('Error loading subject data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [id, apiUrl]);

  const handleLaunchTest = async () => {
    navigate(`/mcq-practice?subject=${subject.name}`);
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!subject) return <div style={{ padding: '40px', textAlign: 'center' }}>Subject not found.</div>;

  // Rich study guides mapped by subject name
  const studyGuides = {
    HTML: [
      {
        topic: 'Horizontal Rules & Line Breaks',
        content: `The \`<hr>\` tag defines a thematic break in an HTML page (e.g., a shift of topic). It is displayed as a horizontal rule that visually separates content. 
The \`<br>\` tag inserts a single line break. It is an empty tag, meaning it has no end tag.`
      },
      {
        topic: 'Strong Importance & Formatting',
        content: `The \`<strong>\` element defines text with strong importance. Browsers typically display the contents of a \`<strong>\` element in bold face. 
Do not confuse with \`<b>\`, which is used only to attract attention without indicating importance.`
      },
      {
        topic: 'Input Fields and Email Inputs',
        content: `Using \`<input type="email">\` creates a textbox for entering email addresses with automatic validation.
Browsers automatically check if the entered text matches the pattern of a standard email (containing "@" and a domain).`
      },
      {
        topic: 'Semantic HTML5 Elements',
        content: `Semantic elements clearly describe their meaning to both the browser and the developer (e.g., \`<header>\`, \`<aside>\`, \`<article>\`, \`<footer>\`).
Non-semantic elements (\`<div>\`, \`<span>\`) tell nothing about their contents.`
      }
    ],
    CSS: [
      {
        topic: 'Static Positioning',
        content: `HTML elements are positioned \`static\` by default. Static positioned elements are not affected by the \`top\`, \`bottom\`, \`left\`, and \`right\` properties.
An element with \`position: static;\` is not positioned in any special way; it is always positioned according to the normal flow of the page.`
      },
      {
        topic: 'Margin vs Padding',
        content: `**Margin**: Creates space *outside* the border of an element. Margins are used to separate elements from each other.
**Padding**: Creates space *inside* the border of an element, between the content and the border. Padding increases the click area and provides breathing room for text.`
      },
      {
        topic: 'CSS Box Model',
        content: `Every HTML element is represented as a rectangular box. The box model consists of:
- **Content**: The actual text or images.
- **Padding**: Clears an area around the content. Inside the border.
- **Border**: A border that goes around the padding and content.
- **Margin**: Clears an area outside the border.`
      }
    ],
    JavaScript: [
      {
        topic: 'Typeof Null Oddity',
        content: `In JavaScript, executing \`typeof null\` returns \`"object"\`. 
This is a historic bug from the first version of JS where values were stored in 32-bit units, with type tags representing their types. Since 000 was the tag for object, and null was represented as the null pointer (0x00), null was mistakenly treated as an object.`
      },
      {
        topic: 'Closures & Scopes',
        content: `A **closure** is the combination of a function bundled together with references to its surrounding state (the lexical environment). 
Closures allow an inner function to access variables from its outer enclosing scope even after the outer function has finished executing.`
      },
      {
        topic: 'Promises & Async flow',
        content: `A \`Promise\` is a proxy for a value not necessarily known when the promise is created. It allows you to associate handlers with an asynchronous action's eventual success value or failure reason.
Promises exist in three states: \`pending\`, \`fulfilled\`, or \`rejected\`.`
      }
    ],
    Java: [
      {
        topic: 'Final Keyword',
        content: `The \`final\` keyword in Java is used to restrict the user:
- **Final Variable**: Creates a constant whose value cannot be reassigned.
- **Final Method**: Cannot be overridden by subclasses.
- **Final Class**: Cannot be extended/inherited.`
      },
      {
        topic: 'String Content Equality',
        content: `In Java, the \`==\` operator checks if both references point to the exact same object location in memory. 
To compare the actual character sequences (content) of two strings, you must use the \`equals()\` method (e.g., \`str1.equals(str2)\`).`
      },
      {
        topic: 'OOP Core Abstractions',
        content: `Java OOP relies on 4 main pillars:
1. **Inheritance**: Subclasses inheriting fields/methods from parent classes.
2. **Polymorphism**: Single interface/parent reference acting differently (overriding, overloading).
3. **Abstraction**: Hiding implementation details (abstract classes, interfaces).
4. **Encapsulation**: Binding data and methods together while restricting access (private fields, getters/setters).`
      }
    ],
    Unix: [
      {
        topic: 'Print Working Directory (pwd)',
        content: `The \`pwd\` command prints the absolute path of your current working directory, starting from the root directory (\`/\`). Useful for tracking command locations.`
      },
      {
        topic: 'awk Text Processing',
        content: `\`awk\` is a powerful pattern scanning and processing language. 
Example: \`awk -F'-' '{print $1}' input.txt\` splits lines by hyphen and prints the first column.
- \`NR\` represents the current line number (Record Number).
- \`$0\` represents the entire current line.`
      },
      {
        topic: 'grep Regular Expressions',
        content: `\`grep\` searches files for a specific pattern or regex.
- \`grep -i "pattern" file\`: Case insensitive search.
- \`grep -v "pattern" file\`: Inverted search (prints lines *not* matching pattern).`
      }
    ],
    SQL: [
      {
        topic: 'SQL Aggregate Functions',
        content: `Aggregate functions perform a calculation on a set of values and return a single value:
- \`MAX(column)\`: Finds largest value.
- \`MIN(column)\`: Finds smallest value.
- \`SUM(column)\`: Computes total sum.
- \`AVG(column)\`: Computes mathematical average.`
      },
      {
        topic: 'Primary Key Constraints',
        content: `A \`PRIMARY KEY\` constraint uniquely identifies each record in a table.
Primary keys must contain unique values, cannot contain \`NULL\` values, and a table can have only one primary key.`
      }
    ],
    'PL SQL': [
      {
        topic: 'Variables and Operators',
        content: `In PL/SQL:
- Variable assignment is written as \`:=\` (e.g., \`num := 10;\`).
- String concatenation is written using double pipe \`||\` (e.g., \`'Hello ' || 'World'\`).`
      },
      {
        topic: 'Cursors & Triggers',
        content: `- **Cursor**: A pointer to a private SQL memory area. Used to fetch multiple rows returned by a query one-by-one.
- **Trigger**: A stored PL/SQL block that automatically executes in response to certain events (e.g., INSERT, UPDATE, DELETE on a table).`
      }
    ]
  };

  const activeGuideList = studyGuides[subject.name] || [];
  const currentGuide = activeGuideList.find(g => g.topic === selectedTopic) || activeGuideList[0];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Back to dashboard */}
      <button
        onClick={() => navigate('/')}
        className="btn-secondary"
        style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Hero Header */}
      <div className="glass" style={{ padding: '32px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>TRAINING MODULE</span>
          <h2 style={{ fontSize: '32px', marginTop: '8px', fontWeight: 800 }}>{subject.name} Core</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', maxWidth: '600px' }}>
            {subject.description}
          </p>
        </div>

        <button
          onClick={handleLaunchTest}
          className="btn-primary"
          style={{ padding: '14px 28px', fontSize: '15px' }}
        >
          <Play size={18} fill="#ffffff" /> Launch Subject Test
        </button>
      </div>

      {/* Main Study Guide Split Screen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '30px' }}>
        
        {/* Left Side: Topic list selector */}
        <div className="glass" style={{ padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--color-secondary)' }}>TOPIC MODULES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeGuideList.map((guide) => (
              <button
                key={guide.topic}
                onClick={() => setSelectedTopic(guide.topic)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: guide.topic === selectedTopic ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                  background: guide.topic === selectedTopic ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                  color: guide.topic === selectedTopic ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  fontWeight: guide.topic === selectedTopic ? 600 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={16} />
                  <span>{guide.topic}</span>
                </div>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Notes Panel */}
        <div className="glass" style={{ padding: '32px' }}>
          {currentGuide ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>STUDY NOTE SHEET</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{currentGuide.topic}</h3>
              </div>
              
              <div
                style={{
                  lineHeight: '1.8',
                  fontSize: '15px',
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {/* Parse basic markdown like bold or code tags inside content */}
                {currentGuide.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} style={{ marginBottom: '16px' }}>
                    {para.split(' ').map((word, wIdx) => {
                      if (word.startsWith('`') && word.endsWith('`')) {
                        return <code key={wIdx} style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '13.5px' }}>{word.slice(1, -1)} </code>;
                      }
                      if (word.startsWith('**') && word.endsWith('**')) {
                        return <strong key={wIdx} style={{ color: '#ffffff' }}>{word.slice(2, -2)} </strong>;
                      }
                      return word + ' ';
                    })}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No study guide notes compiled for this subject yet. Run mock assessments to review details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SubjectDetail;
