import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '..', 'temp_run');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Detect if bash is available on Windows/OS
let isBashAvailable = false;
try {
  execSync('bash --version', { stdio: 'ignore' });
  isBashAvailable = true;
} catch (e) {
  isBashAvailable = false;
}

/**
 * JS-based Unix Command Simulator fallback for standard utilities.
 * Handles pipes, cat, grep, awk (basic aggregation/printing), sed, wc, sort, cut, head, tail, echo, pwd.
 */
class UnixSimulator {
  constructor(inputFileContent = '') {
    this.files = {
      'input.txt': inputFileContent,
      'file.txt': inputFileContent
    };
    this.pwd = '/home/student';
  }

  simulate(pipelineText) {
    // Clean pipeline
    const commands = pipelineText.split('|').map(cmd => cmd.trim());
    let currentData = '';

    for (let i = 0; i < commands.length; i++) {
      const parts = this.parseCommand(commands[i]);
      if (parts.length === 0) continue;

      const cmdName = parts[0];
      const args = parts.slice(1);

      switch (cmdName) {
        case 'cat':
          currentData = this.cat(args, currentData);
          break;
        case 'grep':
          currentData = this.grep(args, currentData);
          break;
        case 'awk':
          currentData = this.awk(args, currentData);
          break;
        case 'sed':
          currentData = this.sed(args, currentData);
          break;
        case 'wc':
          currentData = this.wc(args, currentData);
          break;
        case 'sort':
          currentData = this.sort(args, currentData);
          break;
        case 'cut':
          currentData = this.cut(args, currentData);
          break;
        case 'head':
          currentData = this.head(args, currentData);
          break;
        case 'tail':
          currentData = this.tail(args, currentData);
          break;
        case 'echo':
          currentData = this.echo(args, currentData);
          break;
        case 'pwd':
          currentData = this.pwd + '\n';
          break;
        default:
          throw new Error(`Command '${cmdName}' is not supported in the simulator fallback. Please install Bash.`);
      }
    }

    return currentData.replace(/\r\n/g, '\n');
  }

  parseCommand(cmdString) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const parts = [];
    let match;
    while ((match = regex.exec(cmdString)) !== null) {
      parts.push(match[1] || match[2] || match[0]);
    }
    return parts;
  }

  cat(args, inputData) {
    // If files are specified
    const fileArgs = args.filter(a => !a.startsWith('-'));
    if (fileArgs.length > 0) {
      return fileArgs.map(f => this.files[f] || '').join('\n');
    }
    return inputData;
  }

  grep(args, inputData) {
    let pattern = '';
    let invert = false;
    let ignoreCase = false;
    const files = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-v') invert = true;
      else if (arg === '-i') ignoreCase = true;
      else if (arg.startsWith('-')) {
        if (arg.includes('v')) invert = true;
        if (arg.includes('i')) ignoreCase = true;
      } else if (!pattern) {
        pattern = arg;
      } else {
        files.push(arg);
      }
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/);
    const flags = ignoreCase ? 'i' : '';
    const regex = new RegExp(pattern, flags);

    const filtered = lines.filter(line => {
      const hasMatch = regex.test(line);
      return invert ? !hasMatch : hasMatch;
    });

    return filtered.join('\n');
  }

  awk(args, inputData) {
    let script = '';
    let delimiter = ' ';
    const files = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-F') {
        delimiter = args[++i];
      } else if (arg.startsWith('-F')) {
        delimiter = arg.slice(2);
      } else if (!script) {
        script = arg;
      } else {
        files.push(arg);
      }
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/).filter(l => l.trim() !== '');
    const outputLines = [];

    // Simple awk parser
    // E.g. NR==1 {print "Custid Total"} NR>1 {print $1, $2+$3+$4}
    // E.g. {print $1}
    const rules = [];
    
    // Parse rules
    const ruleRegex = /(?:(NR==\d+|NR>\d+|NR<\d+)?\s*\{([^}]+)\})/g;
    let match;
    let hasRules = false;
    while ((match = ruleRegex.exec(script)) !== null) {
      hasRules = true;
      rules.push({
        condition: match[1] || 'true',
        action: match[2].trim()
      });
    }

    if (!hasRules) {
      // Default to executing action on all lines
      rules.push({
        condition: 'true',
        action: script.replace(/[{}]/g, '').trim()
      });
    }

    lines.forEach((line, index) => {
      const NR = index + 1;
      const fields = line.split(delimiter).map(f => f.trim());
      // $0 is the whole line, $1, $2 are fields
      const $0 = line;
      
      // Check condition
      for (const rule of rules) {
        let isConditionMet = false;
        if (rule.condition === 'true') {
          isConditionMet = true;
        } else if (rule.condition.startsWith('NR==')) {
          const val = parseInt(rule.condition.slice(4));
          isConditionMet = (NR === val);
        } else if (rule.condition.startsWith('NR>')) {
          const val = parseInt(rule.condition.slice(3));
          isConditionMet = (NR > val);
        } else if (rule.condition.startsWith('NR<')) {
          const val = parseInt(rule.condition.slice(3));
          isConditionMet = (NR < val);
        }

        if (isConditionMet) {
          if (rule.action.startsWith('print')) {
            const printContent = rule.action.slice(5).trim();
            // Parse print arguments: can be strings "..." or fields $1 or expressions $2+$3
            const parts = [];
            
            // Simple split print arguments by comma
            const printArgs = printContent.split(',').map(a => a.trim());
            const outputRow = printArgs.map(arg => {
              if (arg.startsWith('"') && arg.endsWith('"')) {
                return arg.slice(1, -1);
              }
              if (arg.startsWith("'") && arg.endsWith("'")) {
                return arg.slice(1, -1);
              }
              
              // Evaluate field references and mathematical operators
              // Replace $1 with fields[0], $2 with fields[1], etc.
              let evalStr = arg.replace(/\$(\d+)/g, (m, g) => {
                const idx = parseInt(g);
                if (idx === 0) return JSON.stringify($0);
                return fields[idx - 1] ? (isNaN(fields[idx - 1]) ? `"${fields[idx - 1]}"` : fields[idx - 1]) : '""';
              });
              
              try {
                // Securely evaluate basic arithmetic
                const res = new Function(`return ${evalStr}`)();
                return res;
              } catch (e) {
                return '';
              }
            }).join(' ');
            
            outputLines.push(outputRow);
          }
        }
      }
    });

    return outputLines.join('\n');
  }

  sed(args, inputData) {
    let script = '';
    const files = [];

    for (let i = 0; i < args.length; i++) {
      if (!script) script = args[i];
      else files.push(args[i]);
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    // sed 's/old/new/g'
    if (script.startsWith('s/')) {
      const parts = script.split('/');
      const search = parts[1];
      const replace = parts[2];
      const flags = parts[3] || '';
      
      const regex = new RegExp(search, flags.includes('g') ? 'g' : '');
      return targetText.replace(regex, replace);
    }

    return targetText;
  }

  wc(args, inputData) {
    let countLines = false;
    let countWords = false;
    let countChars = false;
    const files = [];

    for (const arg of args) {
      if (arg === '-l') countLines = true;
      else if (arg === '-w') countWords = true;
      else if (arg === '-c') countChars = true;
      else if (arg.startsWith('-')) {
        if (arg.includes('l')) countLines = true;
        if (arg.includes('w')) countWords = true;
        if (arg.includes('c')) countChars = true;
      } else {
        files.push(arg);
      }
    }

    // Default to all
    if (!countLines && !countWords && !countChars) {
      countLines = countWords = countChars = true;
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText === '' ? 0 : targetText.split(/\r?\n/).length;
    const words = targetText === '' ? 0 : targetText.trim().split(/\s+/).length;
    const chars = targetText.length;

    const results = [];
    if (countLines) results.push(lines);
    if (countWords) results.push(words);
    if (countChars) results.push(chars);

    return results.join(' ');
  }

  sort(args, inputData) {
    let numeric = false;
    let reverse = false;
    const files = [];

    for (const arg of args) {
      if (arg === '-n') numeric = true;
      else if (arg === '-r') reverse = true;
      else if (arg.startsWith('-')) {
        if (arg.includes('n')) numeric = true;
        if (arg.includes('r')) reverse = true;
      } else {
        files.push(arg);
      }
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/).filter(l => l !== '');
    lines.sort((a, b) => {
      if (numeric) {
        const na = parseFloat(a) || 0;
        const nb = parseFloat(b) || 0;
        return na - nb;
      }
      return a.localeCompare(b);
    });

    if (reverse) lines.reverse();
    return lines.join('\n');
  }

  cut(args, inputData) {
    let delimiter = '\t';
    let fields = [];
    const files = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-d') {
        delimiter = args[++i];
      } else if (arg.startsWith('-d')) {
        delimiter = arg.slice(2);
      } else if (arg === '-f') {
        fields = this.parseFields(args[++i]);
      } else if (arg.startsWith('-f')) {
        fields = this.parseFields(arg.slice(2));
      } else {
        files.push(arg);
      }
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/);
    const cutLines = lines.map(line => {
      const cols = line.split(delimiter);
      return fields.map(idx => cols[idx - 1] || '').join(delimiter);
    });

    return cutLines.join('\n');
  }

  parseFields(fStr) {
    // e.g. "1,2", "1-3", "2"
    if (fStr.includes(',')) {
      return fStr.split(',').map(n => parseInt(n));
    }
    if (fStr.includes('-')) {
      const [start, end] = fStr.split('-').map(n => parseInt(n));
      const range = [];
      for (let i = start; i <= end; i++) range.push(i);
      return range;
    }
    return [parseInt(fStr)];
  }

  head(args, inputData) {
    let count = 10;
    const files = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-n') count = parseInt(args[++i]);
      else if (arg.startsWith('-')) count = parseInt(arg.slice(1));
      else files.push(arg);
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/);
    return lines.slice(0, count).join('\n');
  }

  tail(args, inputData) {
    let count = 10;
    const files = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-n') count = parseInt(args[++i]);
      else if (arg.startsWith('-')) count = parseInt(arg.slice(1));
      else files.push(arg);
    }

    let targetText = inputData;
    if (files.length > 0) {
      targetText = files.map(f => this.files[f] || '').join('\n');
    }

    const lines = targetText.split(/\r?\n/);
    return lines.slice(-count).join('\n');
  }

  echo(args, inputData) {
    return args.join(' ') + '\n';
  }
}

/**
 * Compiles and runs a Java program
 */
export const runJavaCode = async (code, testCases) => {
  // Regex to extract public class name
  const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  const className = classMatch ? classMatch[1] : 'Solution';

  const runId = Math.random().toString(36).substring(7);
  const runDir = path.join(TEMP_DIR, `java_${runId}`);
  fs.mkdirSync(runDir, { recursive: true });

  const sourceFile = path.join(runDir, `${className}.java`);
  fs.writeFileSync(sourceFile, code);

  return new Promise((resolve) => {
    // Compile Java code
    exec(`javac "${sourceFile}"`, { timeout: 10000 }, (compileError, stdout, stderr) => {
      if (compileError) {
        // Cleanup directory
        fs.rmSync(runDir, { recursive: true, force: true });
        return resolve({
          success: false,
          errorType: 'compilation',
          error: stderr || compileError.message,
          results: []
        });
      }

      // Compiled successfully, run test cases
      const results = [];
      let index = 0;

      const runNextTestCase = () => {
        if (index >= testCases.length) {
          // All test cases executed, cleanup and resolve
          fs.rmSync(runDir, { recursive: true, force: true });
          resolve({
            success: true,
            results
          });
          return;
        }

        const tc = testCases[index];
        const inputData = tc.input;
        const expectedOutput = tc.output.trim().replace(/\r\n/g, '\n');

        // Run the class using java
        const runProcess = exec(`java -cp "${runDir}" ${className}`, { timeout: 3000 }, (runError, rStdout, rStderr) => {
          let passed = false;
          let actualOutput = rStdout ? rStdout.trim().replace(/\r\n/g, '\n') : '';
          let errorLog = rStderr || '';

          if (runError) {
            if (runError.killed) {
              errorLog = 'Time Limit Exceeded (3s)';
            } else {
              errorLog = rStderr || runError.message;
            }
          } else {
            passed = (actualOutput === expectedOutput);
          }

          results.push({
            input: inputData,
            expected: expectedOutput,
            actual: actualOutput,
            error: errorLog,
            passed,
            isHidden: tc.isHidden || false
          });

          index++;
          runNextTestCase();
        });

        // Write input to process stdin
        if (inputData && runProcess.stdin) {
          runProcess.stdin.write(inputData);
          runProcess.stdin.end();
        }
      };

      runNextTestCase();
    });
  });
};

/**
 * Executes a Unix pipeline command
 */
export const runUnixCode = async (command, testCases) => {
  const runId = Math.random().toString(36).substring(7);
  const runDir = path.join(TEMP_DIR, `unix_${runId}`);
  fs.mkdirSync(runDir, { recursive: true });

  const results = [];

  for (const tc of testCases) {
    const inputData = tc.input;
    const expectedOutput = tc.output.trim().replace(/\r\n/g, '\n');
    let actualOutput = '';
    let errorLog = '';
    let passed = false;

    if (isBashAvailable) {
      // Execute in actual bash
      const inputPath = path.join(runDir, 'input.txt');
      fs.writeFileSync(inputPath, inputData);

      await new Promise((resolve) => {
        // Substitute input.txt references in command or pipe it
        // E.g., replace 'input.txt' or run: cat input.txt | command
        let executionCommand = command;
        if (!command.includes('input.txt') && !command.includes('file.txt')) {
          executionCommand = `cat "${inputPath}" | ${command}`;
        } else {
          // Replace references to input.txt/file.txt with path
          executionCommand = command
            .replace(/input\.txt/g, `"${inputPath}"`)
            .replace(/file\.txt/g, `"${inputPath}"`);
        }

        exec(`bash -c "${executionCommand}"`, { timeout: 3000, cwd: runDir }, (err, stdout, stderr) => {
          if (err) {
            if (err.killed) {
              errorLog = 'Time Limit Exceeded (3s)';
            } else {
              errorLog = stderr || err.message;
            }
          } else {
            actualOutput = stdout ? stdout.trim().replace(/\r\n/g, '\n') : '';
            passed = (actualOutput === expectedOutput);
          }
          resolve();
        });
      });
    } else {
      // Fallback to Unix JS Simulator
      try {
        const simulator = new UnixSimulator(inputData);
        actualOutput = simulator.simulate(command).trim();
        passed = (actualOutput === expectedOutput);
      } catch (err) {
        errorLog = err.message;
      }
    }

    results.push({
      input: inputData,
      expected: expectedOutput,
      actual: actualOutput,
      error: errorLog,
      passed,
      isHidden: tc.isHidden || false
    });
  }

  // Cleanup
  fs.rmSync(runDir, { recursive: true, force: true });

  return {
    success: true,
    results
  };
};
