import Question from '../models/Question.js';

// Helper to parse CSV lines correctly (respecting quotes)
const parseCSV = (csvText) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
};

// @desc    Get questions with filters
// @route   GET /api/questions
// @access  Private
export const getQuestions = async (req, res) => {
  const { subject, topic, questionType, difficulty, search } = req.query;
  const filter = {};

  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (questionType) filter.questionType = questionType;
  if (difficulty) filter.difficulty = difficulty;
  if (search) {
    filter.question = { $regex: search, $options: 'i' };
  }

  try {
    const questions = await Question.find(filter);
    return res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching questions' });
  }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private/Admin
export const createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    const createdQuestion = await question.save();
    return res.status(201).json({ success: true, data: createdQuestion });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: 'Invalid question data', error: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Update fields
    Object.assign(question, req.body);
    const updatedQuestion = await question.save();

    return res.json({ success: true, data: updatedQuestion });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: 'Update failed', error: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await question.deleteOne();
    return res.json({ success: true, message: 'Question removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error removing question' });
  }
};

// @desc    Bulk Import questions via JSON or CSV
// @route   POST /api/questions/import
// @access  Private/Admin
export const importQuestions = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer.toString('utf-8');
    let questionsToInsert = [];

    if (req.file.originalname.endsWith('.json')) {
      questionsToInsert = JSON.parse(fileContent);
    } else if (req.file.originalname.endsWith('.csv')) {
      const csvRows = parseCSV(fileContent);
      if (csvRows.length < 2) {
        return res.status(400).json({ success: false, message: 'CSV file is empty or missing header row' });
      }

      const headers = csvRows[0].map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i];
        if (row.length !== headers.length) continue; // Skip malformed rows
        
        const qObj = {};
        headers.forEach((header, index) => {
          qObj[header] = row[index].trim();
        });

        // Construct Question Format
        const formattedQuestion = {
          subject: qObj.subject,
          topic: qObj.topic,
          questionType: qObj.questiontype ? qObj.questiontype.toUpperCase() : 'MCQ',
          question: qObj.question,
          difficulty: qObj.difficulty || 'Easy',
          explanation: qObj.explanation || '',
        };

        if (formattedQuestion.questionType === 'MCQ') {
          formattedQuestion.options = [
            qObj.optiona || qObj.option1,
            qObj.optionb || qObj.option2,
            qObj.optionc || qObj.option3,
            qObj.optiond || qObj.option4
          ].filter(Boolean);
          
          formattedQuestion.answer = qObj.answer || '';
        } else {
          // SPQ formatting
          formattedQuestion.description = qObj.description || '';
          formattedQuestion.inputFormat = qObj.inputformat || '';
          formattedQuestion.outputFormat = qObj.outputformat || '';
          formattedQuestion.sampleInput = qObj.sampleinput || '';
          formattedQuestion.sampleOutput = qObj.sampleoutput || '';
          formattedQuestion.constraints = qObj.constraints || '';
          formattedQuestion.starterCode = qObj.startercode || '';
          formattedQuestion.solution = qObj.solution || '';

          // Parse test cases if defined as JSON string, otherwise construct default cases
          if (qObj.testcases) {
            try {
              formattedQuestion.testCases = JSON.parse(qObj.testcases);
            } catch (e) {
              // Fallback to sample input/output as single test case
              formattedQuestion.testCases = [
                { input: formattedQuestion.sampleInput, output: formattedQuestion.sampleOutput, isHidden: false }
              ];
            }
          } else {
            formattedQuestion.testCases = [
              { input: formattedQuestion.sampleInput, output: formattedQuestion.sampleOutput, isHidden: false }
            ];
          }
        }
        
        questionsToInsert.push(formattedQuestion);
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload JSON or CSV.' });
    }

    if (questionsToInsert.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions found to import' });
    }

    // Insert questions
    const createdQuestions = await Question.insertMany(questionsToInsert);
    return res.status(201).json({
      success: true,
      message: `Successfully imported ${createdQuestions.length} questions.`,
      count: createdQuestions.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
};
