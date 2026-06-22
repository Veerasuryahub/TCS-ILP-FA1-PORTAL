import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Question from './models/Question.js';
import Result from './models/Result.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Question.deleteMany({});
    await Result.deleteMany({});

    console.log('Database cleared.');

    // 1. Create Default Users (one Admin, one Student)
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    const admin = await User.create({
      name: 'Senior Mentor (Admin)',
      email: 'admin@fa1master.com',
      password: adminPassword,
      role: 'admin',
      college: 'TCS Corporate Office',
      batch: '2026',
      department: 'L&D Faculty',
      badges: ['Master Coach']
    });

    const student = await User.create({
      name: 'TCS ILP Trainee',
      email: 'student@fa1master.com',
      password: studentPassword,
      role: 'student',
      college: 'National Institute of Technology',
      batch: 'Batch 1 - 2026',
      department: 'Systems Engineering',
      streak: 5,
      lastActive: new Date(),
      badges: ['Welcome Cadet', '3-Day Warrior']
    });

    console.log('Users seeded.');

    // 2. Create Subjects
    const subjects = [
      { name: 'HTML', description: 'HyperText Markup Language - Structure of Web Pages', icon: 'FileCode' },
      { name: 'CSS', description: 'Cascading Style Sheets - Visual Styling and Styling Frameworks', icon: 'Palette' },
      { name: 'JavaScript', description: 'Modern JavaScript (ES6+) Core Fundamentals and Web API Actions', icon: 'Layers' },
      { name: 'Java', description: 'Java Object Oriented Programming and Problem Solving Fundamentals', icon: 'Coffee' },
      { name: 'Unix', description: 'Linux Shell Operations and Command Pipeline Manipulations', icon: 'Terminal' },
      { name: 'SQL', description: 'Structured Query Language - Selects, Joins, Aggregations', icon: 'Database' },
      { name: 'PL SQL', description: 'Procedural SQL - Blocks, cursors, triggers, exceptions', icon: 'Cpu' }
    ];

    await Subject.insertMany(subjects);
    console.log('Subjects seeded.');

    // 3. Create Questions (MCQs)
    const mcqQuestions = [
      // HTML
      {
        subject: 'HTML',
        topic: 'Horizontal Rules',
        questionType: 'MCQ',
        question: 'Which of the following tag inserts a horizontal line/rule in an HTML document?',
        options: ['<line>', '<br>', '<hr>', '<border>'],
        answer: '<hr>',
        explanation: 'The <hr> tag defines a thematic break in an HTML page (e.g., a shift of topic). It is displayed as a horizontal rule that visually separates content.',
        difficulty: 'Easy'
      },
      {
        subject: 'HTML',
        topic: 'Formatting Elements',
        questionType: 'MCQ',
        question: 'Which tag is used to define text with strong importance?',
        options: ['<bold>', '<strong>', '<i>', '<emp>'],
        answer: '<strong>',
        explanation: 'The HTML <strong> element is used to define text with strong importance. Browsers typically display the contents of a <strong> element in bold face.',
        difficulty: 'Easy'
      },
      {
        subject: 'HTML',
        topic: 'Input Fields',
        questionType: 'MCQ',
        question: 'What is the correct value for the type attribute of the <input> element to create a textbox for entering email addresses with automatic validation?',
        options: ['email', 'text', 'address', 'mail'],
        answer: 'email',
        explanation: 'Using <input type="email"> provides built-in email structure validation in modern browsers, ensuring the input matches an email pattern.',
        difficulty: 'Medium'
      },
      {
        subject: 'HTML',
        topic: 'Semantic HTML',
        questionType: 'MCQ',
        question: 'Which of the following is NOT a semantic HTML element?',
        options: ['<article>', '<aside>', '<div>', '<header>'],
        answer: '<div>',
        explanation: 'A semantic element clearly describes its meaning to both the browser and the developer (e.g., <header>, <article>). <div> and <span> are non-semantic elements.',
        difficulty: 'Medium'
      },

      // CSS
      {
        subject: 'CSS',
        topic: 'Positioning',
        questionType: 'MCQ',
        question: 'What is the default value of the position property in CSS?',
        options: ['absolute', 'relative', 'static', 'fixed'],
        answer: 'static',
        explanation: 'HTML elements are positioned static by default. Static positioned elements are not affected by the top, bottom, left, and right properties.',
        difficulty: 'Easy'
      },
      {
        subject: 'CSS',
        topic: 'Box Model',
        questionType: 'MCQ',
        question: 'What property is used to create space OUTSIDE the border of an element?',
        options: ['padding', 'margin', 'border-spacing', 'outline'],
        answer: 'margin',
        explanation: 'The CSS margin properties are used to create space around elements, outside of any defined borders.',
        difficulty: 'Easy'
      },
      {
        subject: 'CSS',
        topic: 'Box Model Padding',
        questionType: 'MCQ',
        question: 'What property is used to create space BETWEEN the border and the content inside?',
        options: ['margin', 'padding', 'border-width', 'inset'],
        answer: 'padding',
        explanation: 'Padding is the space inside an element, between the content and the border.',
        difficulty: 'Easy'
      },

      // JavaScript
      {
        subject: 'JavaScript',
        topic: 'Type Definitions',
        questionType: 'MCQ',
        question: 'What is the output of: console.log(typeof null); in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"symbol"'],
        answer: '"object"',
        explanation: 'In JavaScript, typeof null is "object". This is a long-standing historical bug in the language implementation that was kept for backward compatibility.',
        difficulty: 'Medium'
      },
      {
        subject: 'JavaScript',
        topic: 'Closures',
        questionType: 'MCQ',
        question: 'Which of the following terms describes the ability of a function to access variables from its outer enclosing lexical scope even after that outer function has returned?',
        options: ['Hoisting', 'Closure', 'Callback', 'Prototype chain'],
        answer: 'Closure',
        explanation: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
        difficulty: 'Hard'
      },

      // Java
      {
        subject: 'Java',
        topic: 'Keywords',
        questionType: 'MCQ',
        question: 'Which keyword in Java is used to prevent a class from being inherited or a method from being overridden?',
        options: ['static', 'final', 'abstract', 'private'],
        answer: 'final',
        explanation: 'The final keyword in Java can be applied to classes to prevent subclassing, to methods to prevent overriding, and to variables to make them constants.',
        difficulty: 'Easy'
      },
      {
        subject: 'Java',
        topic: 'Strings',
        questionType: 'MCQ',
        question: 'Which method should be used to compare the values of two String objects for content equality in Java?',
        options: ['== operator', 'equals() method', 'compareTo() method', 'equalsIgnoreCase() method only'],
        answer: 'equals() method',
        explanation: 'In Java, the == operator compares object references (addresses in memory), whereas the equals() method compares the actual character sequences (content).',
        difficulty: 'Easy'
      },

      // Unix
      {
        subject: 'Unix',
        topic: 'Utilities',
        questionType: 'MCQ',
        question: 'Which Unix command is used to output the absolute path of the current working directory?',
        options: ['cd', 'pwd', 'ls', 'dir'],
        answer: 'pwd',
        explanation: 'The pwd command stands for "print working directory" and displays the absolute path of the directory you are currently in.',
        difficulty: 'Easy'
      },
      {
        subject: 'Unix',
        topic: 'Text processing',
        questionType: 'MCQ',
        question: 'What Unix command displays the last 10 lines of a file by default?',
        options: ['head', 'tail', 'cat', 'less'],
        answer: 'tail',
        explanation: 'The tail command outputs the final part (defaulting to 10 lines) of a file or piped data.',
        difficulty: 'Easy'
      },

      // SQL
      {
        subject: 'SQL',
        topic: 'Aggregations',
        questionType: 'MCQ',
        question: 'Which SQL function is used to find the highest value in a column?',
        options: ['SUM()', 'MAX()', 'HIGH()', 'UPPER()'],
        answer: 'MAX()',
        explanation: 'The MAX() function returns the maximum value in a set of values or column.',
        difficulty: 'Easy'
      },
      {
        subject: 'SQL',
        topic: 'Constraints',
        questionType: 'MCQ',
        question: 'Which constraint uniquely identifies each record in a database table?',
        options: ['FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY', 'NOT NULL'],
        answer: 'PRIMARY KEY',
        explanation: 'The PRIMARY KEY constraint uniquely identifies each record in a table. Primary keys must contain UNIQUE values, and cannot contain NULL values.',
        difficulty: 'Easy'
      },

      // PL SQL
      {
        subject: 'PL SQL',
        topic: 'Variables',
        questionType: 'MCQ',
        question: 'Which operator is used for assignment in PL/SQL?',
        options: ['=', ':=', '==', '=>'],
        answer: ':=',
        explanation: 'In PL/SQL, variables are assigned values using the assignment operator (:=). The single equal sign (=) is used for equality checks.',
        difficulty: 'Easy'
      },
      {
        subject: 'PL SQL',
        topic: 'Cursors',
        questionType: 'MCQ',
        question: 'Which implicit cursor attribute returns the number of rows affected by the last SQL DML statement?',
        options: ['SQL%ROWCOUNT', 'SQL%FOUND', 'SQL%NOTFOUND', 'SQL%ISOPEN'],
        answer: 'SQL%ROWCOUNT',
        explanation: 'SQL%ROWCOUNT yields the number of rows updated, deleted, or inserted by the most recent SQL execution in the PL/SQL block.',
        difficulty: 'Medium'
      }
    ];

    mcqQuestions.push(
      {
        subject: 'Java',
        topic: 'Concurrency',
        questionType: 'MCQ',
        question: 'Which of the following is true about ConcurrentHashMap in Java?',
        options: ['It locks the entire map during write operations.', 'It allows concurrent read and write operations without locking the entire map.', 'It does not allow null keys but allows null values.', 'It throws ConcurrentModificationException during iteration if modified.'],
        answer: 'It allows concurrent read and write operations without locking the entire map.',
        explanation: 'ConcurrentHashMap uses lock striping or CAS operations to allow multiple threads to read and write concurrently without locking the entire map.',
        difficulty: 'Hard'
      },
      {
        subject: 'SQL',
        topic: 'Window Functions',
        questionType: 'MCQ',
        question: 'What is the primary difference between RANK() and DENSE_RANK() in SQL window functions?',
        options: ['RANK() leaves gaps in the ranking sequence when there are ties, while DENSE_RANK() does not.', 'DENSE_RANK() leaves gaps, while RANK() does not.', 'RANK() can only be used with numeric columns.', 'There is no difference; they are aliases.'],
        answer: 'RANK() leaves gaps in the ranking sequence when there are ties, while DENSE_RANK() does not.',
        explanation: 'If two items tie for 1st place, RANK() gives them both 1 and the next item gets 3. DENSE_RANK() gives them both 1, and the next item gets 2.',
        difficulty: 'Hard'
      },
      {
        subject: 'Unix',
        topic: 'Process Management',
        questionType: 'MCQ',
        question: 'Which signal is sent by the "kill -9" command?',
        options: ['SIGTERM', 'SIGINT', 'SIGKILL', 'SIGHUP'],
        answer: 'SIGKILL',
        explanation: 'kill -9 sends the SIGKILL signal, which cannot be caught, blocked, or ignored, forcing the process to terminate immediately.',
        difficulty: 'Medium'
      },
      {
        subject: 'JavaScript',
        topic: 'Event Loop',
        questionType: 'MCQ',
        question: 'In what order are the following executed in the JavaScript Event Loop: setTimeout callbacks, Promise.then callbacks, and synchronous code?',
        options: ['Synchronous code, setTimeout callbacks, Promise.then callbacks', 'Synchronous code, Promise.then callbacks, setTimeout callbacks', 'Promise.then callbacks, Synchronous code, setTimeout callbacks', 'setTimeout callbacks, Promise.then callbacks, Synchronous code'],
        answer: 'Synchronous code, Promise.then callbacks, setTimeout callbacks',
        explanation: 'Synchronous code executes first on the call stack. Promises resolve into the microtask queue, which is processed before the macrotask queue (where setTimeout callbacks are placed).',
        difficulty: 'Hard'
      }
    );

    await Question.insertMany(mcqQuestions);
    console.log('MCQ Questions seeded.');

    // 4. Create Questions (SPQs)
    const spqQuestions = [
      // SPQ 1: Java ASCII
      {
        subject: 'Java',
        topic: 'ASCII',
        questionType: 'SPQ',
        question: 'Java ASCII Even Values',
        description: `Write a Java program that reads a string input and prints all the characters in the string that have an **even** ASCII decimal value. 

### Instructions:
- Implement a class named \`Solution\` containing the main method.
- Read the input using a Scanner.
- Print each matching character on a **new line** in the order they appear.

### Examples:
- Input: \`pROgraM\`
- ASCII Values:
  - 'p' = 112 (Even)
  - 'R' = 82 (Even)
  - 'O' = 79 (Odd)
  - 'g' = 103 (Odd)
  - 'r' = 114 (Even)
  - 'a' = 97 (Odd)
  - 'M' = 77 (Odd)
- Output:
\`\`\`
p
R
r
\`\`\``,
        inputFormat: 'A single line containing the string input.',
        outputFormat: 'Print each character from the input string that has an even ASCII value, each on a new line.',
        sampleInput: 'pROgraM',
        sampleOutput: 'p\nR\nr',
        constraints: '1 <= String length <= 100\nString can contain uppercase, lowercase letters and special characters.',
        starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String str = sc.nextLine();
            // Write your code here
            
        }
    }
}`,
        solution: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String str = sc.nextLine();
            for (int i = 0; i < str.length(); i++) {
                char ch = str.charAt(i);
                if (ch % 2 == 0) {
                    System.out.println(ch);
                }
            }
        }
    }
}`,
        testCases: [
          { input: 'pROgraM', output: 'p\nR\nr', isHidden: false },
          { input: 'Java', output: 'J\nv', isHidden: false },
          { input: 'ABC', output: 'B', isHidden: true },
          { input: '12345', output: '2\n4', isHidden: true }
        ],
        difficulty: 'Easy'
      },

      // SPQ 2: Java Duplicate Characters
      {
        subject: 'Java',
        topic: 'String Manipulation',
        questionType: 'SPQ',
        question: 'Remove Duplicate Characters',
        description: `Write a Java program to remove all duplicate characters from a given string. Keep only the first occurrence of each character.

### Instructions:
- Implement a class named \`Solution\`.
- Print the final string containing only unique characters in their original order.

### Examples:
- Input: \`programming\`
- Output: \`progamin\`

- Input: \`tcs ilp\`
- Output: \`tcs ilp\``,
        inputFormat: 'A single line containing a lowercase string.',
        outputFormat: 'Print the modified string with duplicates removed.',
        sampleInput: 'programming',
        sampleOutput: 'progamin',
        constraints: '1 <= String length <= 1000',
        starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String str = sc.nextLine();
            // Write your code here
            
        }
    }
}`,
        solution: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String str = sc.nextLine();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < str.length(); i++) {
                char ch = str.charAt(i);
                if (sb.indexOf(String.valueOf(ch)) == -1) {
                    sb.append(ch);
                }
            }
            System.out.println(sb.toString());
        }
    }
}`,
        testCases: [
          { input: 'programming', output: 'progamin', isHidden: false },
          { input: 'abaabbcc', output: 'abc', isHidden: false },
          { input: 'tcs ilp', output: 'tcs ilp', isHidden: true },
          { input: 'structure', output: 'structe', isHidden: true }
        ],
        difficulty: 'Medium'
      },

      // SPQ 3: Java Reverse Words
      {
        subject: 'Java',
        topic: 'Loops',
        questionType: 'SPQ',
        question: 'Reverse Words in String',
        description: `Write a Java program that takes a sentence of space-separated words as input and prints the sentence with its words in reversed order.

### Instructions:
- Implement a class named \`Solution\`.
- Words should remain in their original form, but the sequence of words must be reversed.
- Single space must separate words in the output.

### Examples:
- Input: \`I Love Java\`
- Output: \`Java Love I\`

- Input: \`Hello World\`
- Output: \`World Hello\``,
        inputFormat: 'A single sentence containing words separated by single spaces.',
        outputFormat: 'Print the sentence with reversed word ordering.',
        sampleInput: 'I Love Java',
        sampleOutput: 'Java Love I',
        constraints: '1 <= Sentence length <= 500',
        starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String sentence = sc.nextLine();
            // Write your code here
            
        }
    }
}`,
        solution: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String sentence = sc.nextLine();
            String[] words = sentence.split(" ");
            StringBuilder sb = new StringBuilder();
            for (int i = words.length - 1; i >= 0; i--) {
                sb.append(words[i]);
                if (i > 0) {
                    sb.append(" ");
                }
            }
            System.out.println(sb.toString());
        }
    }
}`,
        testCases: [
          { input: 'I Love Java', output: 'Java Love I', isHidden: false },
          { input: 'Hello World', output: 'World Hello', isHidden: false },
          { input: 'TCS ILP FA1 Preparation', output: 'Preparation FA1 ILP TCS', isHidden: true },
          { input: 'Success', output: 'Success', isHidden: true }
        ],
        difficulty: 'Medium'
      },

      // SPQ 4: Unix awk
      {
        subject: 'Unix',
        topic: 'awk',
        questionType: 'SPQ',
        question: 'Unix Order Calculator',
        description: `Write a Unix awk pipeline command that processes an order data file named \`input.txt\` and calculates the total order value for each customer.

### Input File Format (\`input.txt\`):
The file is hyphen-separated (\`-\`) with headers on the first line:
\`\`\`
Custid-Order1-Order2-Order3
C101-55-12-12
C234-67-42-13
C341-90-90-90
C511-40-40-40
\`\`\`

### Output Format:
Print headers \`Custid Total\` (space-separated) and for each customer print their ID and the sum of their three order values:
\`\`\`
Custid Total
C101 79
C234 122
C341 270
C511 120
\`\`\`

### Write your awk command.
Your command should read from \`input.txt\` (or you can use cat and pipe it).
Example command:
\`awk -F'-' 'NR==1 {print "Custid Total"} NR>1 {print $1, $2+$3+$4}' input.txt\``,
        inputFormat: 'A hyphen-separated text file input.txt.',
        outputFormat: 'Space-separated Custid and their Order totals, including headers.',
        sampleInput: `Custid-Order1-Order2-Order3
C101-55-12-12
C234-67-42-13
C341-90-90-90
C511-40-40-40`,
        sampleOutput: `Custid Total\nC101 79\nC234 122\nC341 270\nC511 120`,
        constraints: 'Input file contains 1 header line and up to 50 rows.',
        starterCode: `awk -F'-' 'NR==1 {print "Custid Total"} NR>1 {print $1, $2+$3+$4}' input.txt`,
        solution: `awk -F'-' 'NR==1 {print "Custid Total"} NR>1 {print $1, $2+$3+$4}' input.txt`,
        testCases: [
          {
            input: `Custid-Order1-Order2-Order3\nC101-55-12-12\nC234-67-42-13\nC341-90-90-90\nC511-40-40-40`,
            output: `Custid Total\nC101 79\nC234 122\nC341 270\nC511 120`,
            isHidden: false
          },
          {
            input: `Custid-Order1-Order2-Order3\nC101-10-10-10\nC202-20-20-20`,
            output: `Custid Total\nC101 30\nC202 60`,
            isHidden: true
          }
        ],
        difficulty: 'Hard'
      }
    ];

    spqQuestions.push(
      {
        subject: 'Java',
        topic: 'Streams',
        questionType: 'SPQ',
        question: 'Top N Frequent Words',
        description: `Write a Java program that reads a list of space-separated words, followed by an integer N on the next line.
Print the N most frequent words, ordered by frequency (descending) and then alphabetically (ascending).

### Instructions:
- Implement a class named \`Solution\`.
- All words should be treated as case-sensitive.
- Use Java Streams or Collections framework.

### Examples:
- Input:
\`\`\`
apple banana apple orange banana apple
2
\`\`\`
- Output:
\`\`\`
apple
banana
\`\`\``,
        inputFormat: 'Line 1: Space-separated words.\\nLine 2: An integer N.',
        outputFormat: 'Print the top N words, each on a new line.',
        sampleInput: 'apple banana apple orange banana apple\n2',
        sampleOutput: 'apple\nbanana',
        constraints: '1 <= N <= unique words',
        starterCode: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String line = sc.nextLine();\n            int n = Integer.parseInt(sc.nextLine());\n            // Write your code here\n        }\n    }\n}`,
        solution: `import java.util.*;\nimport java.util.stream.Collectors;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String line = sc.nextLine();\n            int n = Integer.parseInt(sc.nextLine());\n            List<String> words = Arrays.asList(line.split(" "));\n            Map<String, Long> counts = words.stream().collect(Collectors.groupingBy(w -> w, Collectors.counting()));\n            counts.entrySet().stream()\n                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))\n                .limit(n)\n                .forEach(e -> System.out.println(e.getKey()));\n        }\n    }\n}`,
        testCases: [
          { input: 'apple banana apple orange banana apple\n2', output: 'apple\nbanana', isHidden: false },
          { input: 'cat dog bird dog cat elephant\n3', output: 'cat\ndog\nbird', isHidden: true }
        ],
        difficulty: 'Hard'
      },
      {
        subject: 'Unix',
        topic: 'Log Processing',
        questionType: 'SPQ',
        question: 'Count 404 Errors by IP',
        description: `You are given a web server log file named \`access.log\`. Write a Unix pipeline to find all unique IP addresses that encountered a "404" error, and count how many 404 errors each IP had. Output should be sorted by count in descending order.

### Input Format:
Each line is in the format: \`IP - - [Date] "GET /path HTTP/1.1" STATUS SIZE\`
Example:
\`\`\`
192.168.1.1 - - [10/Oct/2026] "GET /index.html" 200 1024
10.0.0.5 - - [10/Oct/2026] "GET /missing" 404 0
192.168.1.1 - - [10/Oct/2026] "GET /notfound" 404 0
10.0.0.5 - - [10/Oct/2026] "GET /none" 404 0
\`\`\`

### Output Format:
Print count followed by a space and the IP address.
Example Output:
\`\`\`
      2 10.0.0.5
      1 192.168.1.1
\`\`\``,
        inputFormat: 'A log file access.log',
        outputFormat: 'count IP',
        sampleInput: '192.168.1.1 - - [10/Oct/2026] "GET /index.html" 200 1024\n10.0.0.5 - - [10/Oct/2026] "GET /missing" 404 0\n192.168.1.1 - - [10/Oct/2026] "GET /notfound" 404 0\n10.0.0.5 - - [10/Oct/2026] "GET /none" 404 0',
        sampleOutput: '      2 10.0.0.5\n      1 192.168.1.1',
        constraints: 'Output must be generated using Unix commands like awk, grep, sort, uniq.',
        starterCode: `awk '$9 == "404" {print $1}' access.log | sort | uniq -c | sort -nr`,
        solution: `awk '$9 == "404" {print $1}' access.log | sort | uniq -c | sort -nr`,
        testCases: [
          { input: '192.168.1.1 - - [10/Oct/2026] "GET /index.html" 200 1024\n10.0.0.5 - - [10/Oct/2026] "GET /missing" 404 0\n192.168.1.1 - - [10/Oct/2026] "GET /notfound" 404 0\n10.0.0.5 - - [10/Oct/2026] "GET /none" 404 0', output: '      2 10.0.0.5\n      1 192.168.1.1', isHidden: false },
          { input: '10.0.0.1 - - [10/Oct/2026] "GET /" 404 0', output: '      1 10.0.0.1', isHidden: true }
        ],
        difficulty: 'Hard'
      }
    );

    await Question.insertMany(spqQuestions);
    console.log('SPQ Questions seeded.');

    // 5. Create some sample student results to populate the Dashboard & Leaderboard right away!
    const results = [
      {
        userId: student._id,
        subject: 'Java',
        testType: 'SPQ',
        score: 200, // 2 out of 3 correct
        totalQuestions: 3,
        correct: 2,
        wrong: 1,
        timeTaken: 1845,
        answers: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: student._id,
        subject: 'Full Mock',
        testType: 'Full Mock',
        score: 250, // 25 out of 30 correct
        totalQuestions: 30,
        correct: 25,
        wrong: 5,
        timeTaken: 1120,
        answers: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // yesterday
      }
    ];

    await Result.insertMany(results);
    console.log('Sample Results seeded.');

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
