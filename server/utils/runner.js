// runner.js
// Completely replaced local exec with Piston API execution for full serverless compatibility on Vercel

export const runJavaCode = async (code, testCases) => {
  // Extract public class name if possible to name the file properly
  const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  const className = classMatch ? classMatch[1] : 'Solution';
  return executeWithPiston('java', '*', code, testCases, `${className}.java`);
};

export const runUnixCode = async (code, testCases) => {
  // We need to write the input string into input.txt for Bash scripts that expect to read a file
  // Piston supports multiple files. We can pass input.txt as an additional file!
  return executeWithPiston('bash', '*', code, testCases, 'script.sh');
};

const executeWithPiston = async (language, version, code, testCases, mainFileName) => {
  const results = [];
  
  for (const tc of testCases) {
    const inputData = tc.input || '';
    const expectedOutput = tc.output ? tc.output.trim().replace(/\r\n/g, '\n') : '';

    try {
      const files = [
        {
          name: mainFileName,
          content: code
        }
      ];

      // For Unix, if they read from input.txt, we provide the input data as a physical file
      if (language === 'bash') {
        files.push({
          name: 'input.txt',
          content: inputData
        });
      }

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          version,
          files,
          stdin: inputData, // Standard input for scanners/System.in
          compile_timeout: 10000,
          run_timeout: 3000
        })
      });

      if (!response.ok) {
        throw new Error(`Piston API Error: ${response.statusText}`);
      }

      const data = await response.json();
      let actualOutput = '';
      let errorLog = '';

      if (data.compile && data.compile.code !== 0) {
        errorLog = data.compile.output;
      } else if (data.run && data.run.code !== 0) {
        errorLog = data.run.output;
        // Sometimes standard output is still relevant for debugging
        actualOutput = data.run.stdout ? data.run.stdout.trim().replace(/\r\n/g, '\n') : '';
      } else if (data.run) {
        actualOutput = data.run.stdout ? data.run.stdout.trim().replace(/\r\n/g, '\n') : '';
        if (data.run.stderr) {
            errorLog = data.run.stderr;
        }
      }

      // Check if output matches
      const passed = (actualOutput === expectedOutput) && !errorLog;

      results.push({
        input: inputData,
        expected: expectedOutput,
        actual: actualOutput,
        error: errorLog,
        passed,
        isHidden: tc.isHidden || false
      });
    } catch (err) {
      results.push({
        input: inputData,
        expected: expectedOutput,
        actual: '',
        error: err.message,
        passed: false,
        isHidden: tc.isHidden || false
      });
    }
  }

  return {
    success: true,
    results
  };
};
