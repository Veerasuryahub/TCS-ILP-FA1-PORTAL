import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Question from './models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const toughQuestions = [
  // Advanced Java MCQs
  {
    subject: 'Java',
    topic: 'Concurrency',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'Which of the following is true about ConcurrentHashMap in Java 8?',
    options: [
      'It locks the entire map during write operations.',
      'It uses segment locking like Java 7.',
      'It uses a compare-and-swap (CAS) approach and synchronized blocks on the first node of the bin.',
      'It does not allow concurrent reads.'
    ],
    answer: 'It uses a compare-and-swap (CAS) approach and synchronized blocks on the first node of the bin.',
    explanation: 'In Java 8, ConcurrentHashMap abandoned Segment locking in favor of Node arrays plus CAS and synchronized blocks on list/tree heads.'
  },
  {
    subject: 'Java',
    topic: 'Streams',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'What happens if you invoke a terminal operation twice on the same Java Stream instance?',
    options: [
      'It executes the terminal operation a second time on the cached results.',
      'It throws an IllegalStateException.',
      'It returns null.',
      'It resets the stream and starts over.'
    ],
    answer: 'It throws an IllegalStateException.',
    explanation: 'A stream can only be operated on (invoking an intermediate or terminal stream operation) once. Reusing it throws IllegalStateException.'
  },
  {
    subject: 'Java',
    topic: 'Garbage Collection',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'Which Garbage Collector pauses application threads the least and is designed for heaps > 10GB?',
    options: [
      'Serial GC',
      'Parallel GC',
      'G1 GC',
      'ZGC (Z Garbage Collector)'
    ],
    answer: 'ZGC (Z Garbage Collector)',
    explanation: 'ZGC is a scalable low latency garbage collector designed to handle heaps ranging from 8MB to 16TB with sub-millisecond max pause times.'
  },
  // Advanced SQL MCQs
  {
    subject: 'SQL',
    topic: 'Window Functions',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'Which function assigns a unique rank to each row within a partition, leaving no gaps in ranking values even if there are ties?',
    options: [
      'RANK()',
      'DENSE_RANK()',
      'ROW_NUMBER()',
      'NTILE()'
    ],
    answer: 'DENSE_RANK()',
    explanation: 'DENSE_RANK() provides a rank without gaps. If two items tie for 1st, the next item is 2nd. RANK() would make the next item 3rd.'
  },
  {
    subject: 'SQL',
    topic: 'Joins',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'What is a CROSS JOIN?',
    options: [
      'A join that returns only matched rows.',
      'A join that returns the Cartesian product of the two tables.',
      'A join that returns all rows from the left table.',
      'A join that matches rows with the same column names.'
    ],
    answer: 'A join that returns the Cartesian product of the two tables.',
    explanation: 'A CROSS JOIN produces a cartesian product, meaning every row from the first table is combined with every row from the second table.'
  },
  {
    subject: 'SQL',
    topic: 'Transactions',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'Which isolation level prevents Dirty Reads and Non-Repeatable Reads, but does NOT prevent Phantom Reads?',
    options: [
      'READ UNCOMMITTED',
      'READ COMMITTED',
      'REPEATABLE READ',
      'SERIALIZABLE'
    ],
    answer: 'REPEATABLE READ',
    explanation: 'REPEATABLE READ prevents non-repeatable reads by keeping read locks until the end of the transaction, but new rows (phantoms) can still be inserted by other transactions.'
  },
  // Advanced Unix MCQs
  {
    subject: 'Unix',
    topic: 'Awk/Sed',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'Which awk command prints the second column of a comma-separated file?',
    options: [
      'awk -F"," \'{print $2}\' file.csv',
      'awk -d"," \'{print $2}\' file.csv',
      'awk -c"," \'{print 2}\' file.csv',
      'awk \'{print $2}\' file.csv'
    ],
    answer: 'awk -F"," \'{print $2}\' file.csv',
    explanation: 'The -F flag defines the field separator. $2 references the second field.'
  },
  {
    subject: 'Unix',
    topic: 'Process Management',
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: 'What does the nohup command do?',
    options: [
      'It kills a process unconditionally.',
      'It suspends a running process.',
      'It runs a command immune to hangups, with output to a non-tty.',
      'It schedules a command to run at a later time.'
    ],
    answer: 'It runs a command immune to hangups, with output to a non-tty.',
    explanation: 'nohup ignores the HUP (hangup) signal, allowing processes to continue running in the background even after the user logs out.'
  },
  // HTML MCQs
  {
    subject: 'HTML', topic: 'Semantics', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which element is semantically best suited to wrap a standalone piece of content like a blog post or news story?',
    options: ['<section>', '<article>', '<div>', '<main>'],
    answer: '<article>',
    explanation: 'The <article> element specifies independent, self-contained content.'
  },
  {
    subject: 'HTML', topic: 'Forms', questionType: 'MCQ', difficulty: 'Medium',
    question: 'How do you specify that an input field must be filled out before submitting a form?',
    options: ['validate="true"', 'required', 'placeholder="..."', 'mandatory'],
    answer: 'required',
    explanation: 'The required attribute is a boolean attribute that specifies that an input field must be filled out before submitting the form.'
  },
  {
    subject: 'HTML', topic: 'Meta Tags', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What is the purpose of the <meta charset="UTF-8"> tag?',
    options: ['To specify the language of the document', 'To define the character encoding for the HTML document', 'To set the viewport for responsive design', 'To link external stylesheets'],
    answer: 'To define the character encoding for the HTML document',
    explanation: 'It tells the browser to use UTF-8 character encoding, which supports almost all characters and symbols.'
  },
  {
    subject: 'HTML', topic: 'Multimedia', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which tag is used to embed audio files on a web page?',
    options: ['<sound>', '<audio>', '<music>', '<media>'],
    answer: '<audio>',
    explanation: 'The <audio> element is used to embed sound content in documents.'
  },
  {
    subject: 'HTML', topic: 'Tables', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which tag is used to define a table header cell?',
    options: ['<thead>', '<th>', '<tc>', '<td>'],
    answer: '<th>',
    explanation: 'The <th> tag defines a header cell in an HTML table, typically rendered bold and centered.'
  },
  // CSS MCQs
  {
    subject: 'CSS', topic: 'Flexbox', questionType: 'MCQ', difficulty: 'Hard',
    question: 'In CSS Flexbox, what does the align-items property control?',
    options: ['Alignment along the main axis', 'Alignment along the cross axis', 'The order of flex items', 'The wrapping of flex items'],
    answer: 'Alignment along the cross axis',
    explanation: 'align-items aligns flex items along the cross axis (vertical by default).'
  },
  {
    subject: 'CSS', topic: 'Grid', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which property is used to define the size of columns in CSS Grid?',
    options: ['grid-template-columns', 'grid-column-size', 'grid-columns', 'grid-auto-columns'],
    answer: 'grid-template-columns',
    explanation: 'The grid-template-columns property specifies the number (and the widths) of columns in a grid layout.'
  },
  {
    subject: 'CSS', topic: 'Selectors', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which selector is used to select all elements with the class "container" that are direct children of a "div"?',
    options: ['div .container', 'div > .container', 'div + .container', 'div ~ .container'],
    answer: 'div > .container',
    explanation: 'The > combinator selects elements that are direct children of the specified parent.'
  },
  {
    subject: 'CSS', topic: 'Animations', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which CSS rule is used to create animations by defining keyframes?',
    options: ['@animate', '@keyframes', '@transition', '@movement'],
    answer: '@keyframes',
    explanation: 'The @keyframes rule is used to define the stages and styles of a CSS animation.'
  },
  {
    subject: 'CSS', topic: 'Specificity', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which of these CSS selectors has the highest specificity?',
    options: ['.my-class', 'div.my-class', '#my-id', 'div#my-id'],
    answer: 'div#my-id',
    explanation: 'An ID selector has higher specificity than classes or elements. Combining an element with an ID adds even more specificity.'
  },
  // JavaScript MCQs
  {
    subject: 'JavaScript', topic: 'Promises', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which method runs when a Promise is either fulfilled or rejected?',
    options: ['.then()', '.catch()', '.finally()', '.done()'],
    answer: '.finally()',
    explanation: 'The .finally() method returns a Promise and executes specified logic regardless of the promise outcome.'
  },
  {
    subject: 'JavaScript', topic: 'Scope', questionType: 'MCQ', difficulty: 'Medium',
    question: 'What type of scope does the "let" keyword use?',
    options: ['Global scope', 'Function scope', 'Block scope', 'Lexical scope'],
    answer: 'Block scope',
    explanation: 'Variables declared with "let" are limited to the block (e.g., {}) in which they are defined.'
  },
  {
    subject: 'JavaScript', topic: 'Arrays', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    answer: 'map()',
    explanation: 'The map() method creates a new array by applying a function to each element of the original array.'
  },
  {
    subject: 'JavaScript', topic: 'Context', questionType: 'MCQ', difficulty: 'Hard',
    question: 'How does an arrow function handle the "this" keyword?',
    options: ['It creates its own "this" context', 'It inherits "this" from its enclosing lexical context', 'It sets "this" to the global window object', 'It sets "this" to undefined strictly'],
    answer: 'It inherits "this" from its enclosing lexical context',
    explanation: 'Arrow functions do not bind their own "this". They inherit the one from the parent scope.'
  },
  {
    subject: 'JavaScript', topic: 'Hoisting', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What happens if you try to access a variable declared with "const" before its declaration?',
    options: ['It returns undefined', 'It throws a ReferenceError', 'It throws a TypeError', 'It creates a global variable'],
    answer: 'It throws a ReferenceError',
    explanation: 'Variables declared with let and const are in a "Temporal Dead Zone" from the start of the block until the declaration is processed.'
  },
  // Java MCQs
  {
    subject: 'Java', topic: 'OOP', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which principle of OOP allows an object to take on many forms?',
    options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
    answer: 'Polymorphism',
    explanation: 'Polymorphism literally means "many forms" and allows methods to do different things based on the object it is acting upon.'
  },
  {
    subject: 'Java', topic: 'Exceptions', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which of the following is true regarding a finally block?',
    options: ['It is executed only if an exception is thrown', 'It is executed only if no exception is thrown', 'It is always executed, unless System.exit() is called', 'It is used to throw an exception explicitly'],
    answer: 'It is always executed, unless System.exit() is called',
    explanation: 'The finally block always runs when the try block exits, guaranteeing the execution of cleanup code.'
  },
  {
    subject: 'Java', topic: 'Collections', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which collection implementation in Java allows fast retrieval by a key?',
    options: ['ArrayList', 'LinkedList', 'HashMap', 'TreeSet'],
    answer: 'HashMap',
    explanation: 'HashMap stores data in key-value pairs, providing O(1) average time complexity for lookups.'
  },
  {
    subject: 'Java', topic: 'Interfaces', questionType: 'MCQ', difficulty: 'Medium',
    question: 'As of Java 8, what new feature was added to interfaces?',
    options: ['Private methods', 'Static inner classes', 'Default methods', 'Multiple inheritance of state'],
    answer: 'Default methods',
    explanation: 'Java 8 introduced default methods in interfaces, allowing interfaces to have methods with implementation without breaking existing code.'
  },
  {
    subject: 'Java', topic: 'Multithreading', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which method must be implemented by a class implementing the Runnable interface?',
    options: ['start()', 'run()', 'execute()', 'init()'],
    answer: 'run()',
    explanation: 'The Runnable interface specifies a single method, run(), which contains the code that the thread will execute.'
  },
  // Unix MCQs
  {
    subject: 'Unix', topic: 'Permissions', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What does the permission "755" represent in a Unix filesystem?',
    options: ['Owner: rwx, Group: rx, Others: rx', 'Owner: rwx, Group: rw, Others: r', 'Owner: rw, Group: rw, Others: r', 'Owner: rx, Group: rwx, Others: rx'],
    answer: 'Owner: rwx, Group: rx, Others: rx',
    explanation: '7 = 4+2+1 (read/write/execute for owner), 5 = 4+1 (read/execute for group/others).'
  },
  {
    subject: 'Unix', topic: 'Search', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which command is used to search for a specific string pattern inside files?',
    options: ['find', 'locate', 'grep', 'awk'],
    answer: 'grep',
    explanation: 'The grep command searches for patterns in files and prints the matching lines.'
  },
  {
    subject: 'Unix', topic: 'Pipes', questionType: 'MCQ', difficulty: 'Medium',
    question: 'What does the pipe symbol "|" do in Unix?',
    options: ['Redirects output to a file', 'Redirects input from a file', 'Passes the stdout of one command as stdin to another', 'Executes commands sequentially if the first succeeds'],
    answer: 'Passes the stdout of one command as stdin to another',
    explanation: 'A pipe connects the standard output of the command on the left to the standard input of the command on the right.'
  },
  {
    subject: 'Unix', topic: 'Processes', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which command shows an interactive, real-time view of running processes?',
    options: ['ps', 'top', 'jobs', 'bg'],
    answer: 'top',
    explanation: 'The top command provides a dynamic, real-time view of a running system and its processes.'
  },
  {
    subject: 'Unix', topic: 'File System', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which command is used to create a new, empty directory?',
    options: ['touch', 'mkdir', 'rmdir', 'cd'],
    answer: 'mkdir',
    explanation: 'mkdir stands for "make directory" and is used to create new directories.'
  },
  // SQL MCQs
  {
    subject: 'SQL', topic: 'Functions', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which SQL function is used to count the number of rows in a table?',
    options: ['TOTAL()', 'SUM()', 'COUNT()', 'ROWS()'],
    answer: 'COUNT()',
    explanation: 'The COUNT() function returns the number of rows that match a specified criterion.'
  },
  {
    subject: 'SQL', topic: 'Filtering', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which clause is used to filter records based on aggregated data?',
    options: ['WHERE', 'HAVING', 'FILTER', 'GROUP BY'],
    answer: 'HAVING',
    explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.'
  },
  {
    subject: 'SQL', topic: 'Joins', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which type of join returns all rows from the left table and matched rows from the right table?',
    options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL OUTER JOIN'],
    answer: 'LEFT JOIN',
    explanation: 'A LEFT JOIN returns all records from the left table, and the matched records from the right table.'
  },
  {
    subject: 'SQL', topic: 'Updates', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What happens if you run an UPDATE statement without a WHERE clause?',
    options: ['It updates only the first row', 'It throws a syntax error', 'It updates all rows in the table', 'It deletes the table'],
    answer: 'It updates all rows in the table',
    explanation: 'Omitting the WHERE clause in an UPDATE statement causes the update to be applied to every single record in the table.'
  },
  {
    subject: 'SQL', topic: 'Data Types', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What is the primary difference between CHAR and VARCHAR data types?',
    options: ['CHAR stores numbers, VARCHAR stores text', 'CHAR is variable-length, VARCHAR is fixed-length', 'CHAR is fixed-length, VARCHAR is variable-length', 'There is no difference'],
    answer: 'CHAR is fixed-length, VARCHAR is variable-length',
    explanation: 'CHAR pads the remaining space with blanks to reach the fixed length, whereas VARCHAR only uses as much space as needed.'
  },
  // PL SQL MCQs
  {
    subject: 'PL SQL', topic: 'Blocks', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which of the following is the mandatory section in a PL/SQL block?',
    options: ['DECLARE', 'EXCEPTION', 'BEGIN ... END', 'HEADER'],
    answer: 'BEGIN ... END',
    explanation: 'Every PL/SQL block must have an executable section, marked by BEGIN and END keywords.'
  },
  {
    subject: 'PL SQL', topic: 'Triggers', questionType: 'MCQ', difficulty: 'Hard',
    question: 'What is a database trigger?',
    options: ['A tool to query large tables', 'A block of code automatically executed in response to certain events', 'A special index on a column', 'A graphical interface for database management'],
    answer: 'A block of code automatically executed in response to certain events',
    explanation: 'A trigger is a stored program that fires automatically when a specific event (like INSERT, UPDATE, DELETE) occurs on a table.'
  },
  {
    subject: 'PL SQL', topic: 'Exceptions', questionType: 'MCQ', difficulty: 'Medium',
    question: 'Which built-in exception is raised when a SELECT INTO statement returns more than one row?',
    options: ['NO_DATA_FOUND', 'TOO_MANY_ROWS', 'INVALID_CURSOR', 'MULTIPLE_ROWS'],
    answer: 'TOO_MANY_ROWS',
    explanation: 'TOO_MANY_ROWS is raised when a single-row SELECT INTO query returns multiple rows.'
  },
  {
    subject: 'PL SQL', topic: 'Cursors', questionType: 'MCQ', difficulty: 'Hard',
    question: 'Which statement is used to fetch the next row from an explicit cursor?',
    options: ['GET', 'NEXT', 'FETCH', 'READ'],
    answer: 'FETCH',
    explanation: 'The FETCH statement retrieves the current row from the active set of an explicit cursor into variables.'
  },
  {
    subject: 'PL SQL', topic: 'Procedures', questionType: 'MCQ', difficulty: 'Medium',
    question: 'What is the difference between a Function and a Procedure in PL/SQL?',
    options: ['Functions can change table data, Procedures cannot', 'Procedures must return a value, Functions may not', 'Functions must return a single value, Procedures do not have to', 'There is no difference'],
    answer: 'Functions must return a single value, Procedures do not have to',
    explanation: 'A PL/SQL Function is designed to compute and return a single value using the RETURN clause, whereas a Procedure performs an action without a mandatory return value.'
  },

  // Tough SPQ - Java Regex / File Parsing
  {
    subject: 'Java',
    topic: 'Strings and Parsing',
    questionType: 'SPQ',
    difficulty: 'Hard',
    question: 'Write a Java program that reads lines from standard input until "EOF". Output the number of valid email addresses found across all lines. A valid email format for this test is string@string.com (alphanumeric only before and after @).',
    description: '### Scenario\nYou need to parse server logs for user emails.\n\n### Task\nRead from System.in until the string `EOF` is read. Count the total valid emails and print the count.\n\n### Format\nValid: `test@test.com`, `user123@domain.com`\nInvalid: `test.user@domain.com`, `user@domain.org` (only .com is allowed for this question).\n\n```java\nimport java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    // your code\n  }\n}\n```',
    inputFormat: 'Multiple lines of text. Last line is exactly "EOF".',
    outputFormat: 'A single integer representing the count.',
    sampleInput: 'Hello user@test.com\nAnother line with invalid@domain.org and valid1@test.com\nEOF',
    sampleOutput: '2',
    constraints: 'Lines < 1000. Use standard java.util.Scanner.',
    starterCode: 'import java.util.Scanner;\nimport java.util.regex.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
    solution: 'import java.util.Scanner;\nimport java.util.regex.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        Pattern p = Pattern.compile("[a-zA-Z0-9]+@[a-zA-Z0-9]+\\\\.com");\n        int count = 0;\n        while(sc.hasNextLine()) {\n            String line = sc.nextLine();\n            if(line.equals("EOF")) break;\n            Matcher m = p.matcher(line);\n            while(m.find()) count++;\n        }\n        System.out.println(count);\n    }\n}',
    testCases: [
      {
        input: 'Hello user@test.com\nAnother line with invalid@domain.org and valid1@test.com\nEOF\n',
        output: '2\n',
        isHidden: false
      },
      {
        input: 'admin@system.com\nno emails here\nEOF\n',
        output: '1\n',
        isHidden: false
      },
      {
        input: 'a@b.com c@d.com e@f.com\nEOF\n',
        output: '3\n',
        isHidden: true
      }
    ]
  },
  // Tough SPQ - Unix
  {
    subject: 'Unix',
    topic: 'Awk/Sed text processing',
    questionType: 'SPQ',
    difficulty: 'Hard',
    question: 'You have a log file format `IP - [DATE] "METHOD PATH HTTP/1.1" STATUS`. Write a Unix pipeline to find the IP address with the most "404" status codes.',
    description: '### Task\nGiven input on STDIN representing an access.log file, find the single IP address that has the highest number of 404 responses. Print just the IP address.\nIf there is a tie, print any of them (the test case will have a unique max).',
    inputFormat: 'Lines of text formatted as Apache access logs.',
    outputFormat: 'A single IP address.',
    sampleInput: '192.168.1.1 - [10/Oct] "GET / HTTP/1.1" 200\n10.0.0.5 - [10/Oct] "GET /img HTTP/1.1" 404\n10.0.0.5 - [10/Oct] "GET /css HTTP/1.1" 404\n192.168.1.1 - [10/Oct] "GET /api HTTP/1.1" 404\n',
    sampleOutput: '10.0.0.5',
    constraints: 'Use basic unix utilities: grep, awk, sort, uniq, head.',
    starterCode: '# Write your shell pipeline here. Data comes from standard input.\n# Example: cat /dev/stdin | grep ...\n',
    solution: 'cat /dev/stdin | awk \'$7 == "404" {print $1}\' | sort | uniq -c | sort -nr | head -n 1 | awk \'{print $2}\'',
    testCases: [
      {
        input: '192.168.1.1 - [10/Oct] "GET / HTTP/1.1" 200\n10.0.0.5 - [10/Oct] "GET /img HTTP/1.1" 404\n10.0.0.5 - [10/Oct] "GET /css HTTP/1.1" 404\n192.168.1.1 - [10/Oct] "GET /api HTTP/1.1" 404\n',
        output: '10.0.0.5\n',
        isHidden: false
      },
      {
        input: '1.1.1.1 - [10/Oct] "GET / HTTP/1.1" 404\n1.1.1.1 - [10/Oct] "GET / HTTP/1.1" 404\n2.2.2.2 - [10/Oct] "GET / HTTP/1.1" 404\n',
        output: '1.1.1.1\n',
        isHidden: true
      }
    ]
  },
  // Tough SPQ - Armstrong Number
  {
    subject: 'Java',
    topic: 'Math and Loops',
    questionType: 'SPQ',
    difficulty: 'Medium',
    question: 'Armstrong Number Check',
    description: '### Scenario\nWrite a Java program to check if a given number is an Armstrong number or not.\nAn Armstrong number of three digits is an integer such that the sum of the cubes of its digits is equal to the number itself.\n\n### Instructions\n- Read a number from standard input.\n- Print "Yes, the number is an Armstrong number." if true, otherwise print "No, the number is not an Armstrong number.".',
    inputFormat: 'A single integer string.',
    outputFormat: 'A single string indicating if it is an Armstrong number.',
    sampleInput: '153',
    sampleOutput: 'Yes, the number is an Armstrong number.',
    constraints: 'The number will be non-negative and fit within standard integer limits.',
    starterCode: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}',
    solution: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String num = sc.nextLine();\n        int sum = 0;\n        for (int i = 0; i < num.length(); i++) {\n            sum += Math.pow(Integer.parseInt(String.valueOf(num.charAt(i))),3);\n        }\n        if(sum == Integer.parseInt(num)) {\n            System.out.println("Yes, the number is an Armstrong number.");\n        } else {\n            System.out.println("No, the number is not an Armstrong number.");\n        }\n    }\n}',
    testCases: [
      { input: '153', output: 'Yes, the number is an Armstrong number.', isHidden: false },
      { input: '123', output: 'No, the number is not an Armstrong number.', isHidden: false },
      { input: '370', output: 'Yes, the number is an Armstrong number.', isHidden: true }
    ]
  },
  // Tough SPQ - Count Vowels, Consonants, and Digits
  {
    subject: 'Java',
    topic: 'Strings',
    questionType: 'SPQ',
    difficulty: 'Medium',
    question: 'Count Characters by Type',
    description: '### Scenario\nWrite a Java program to count the number of vowels, consonants, and digits in a given string.\n\n### Instructions\n- Read a string from standard input.\n- Print the counts of Vowel, Consonant, and Number on separate lines.\n\n### Output Format\n```\nVowel : <count>\nConsonant : <count>\nNumber : <count>\n```',
    inputFormat: 'A single string, possibly containing spaces and special characters.',
    outputFormat: 'Three lines detailing the counts of vowels, consonants, and digits.',
    sampleInput: 'Hello 123',
    sampleOutput: 'Vowel : 2\nConsonant : 3\nNumber : 3',
    constraints: '1 <= String length <= 1000',
    starterCode: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}',
    solution: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        int v=0, c=0, num=0;\n        for(int i=0; i<s.length(); i++) {\n            char ch = s.charAt(i);\n            if(Character.isLetter(ch)) {\n                char lower = Character.toLowerCase(ch);\n                if(lower==\'a\'||lower==\'e\'||lower==\'i\'||lower==\'o\'||lower==\'u\') v++;\n                else c++;\n            } else if(Character.isDigit(ch)) {\n                num++;\n            }\n        }\n        System.out.println("Vowel : " + v);\n        System.out.println("Consonant : " + c);\n        System.out.println("Number : " + num);\n    }\n}',
    testCases: [
      { input: 'Hello 123', output: 'Vowel : 2\nConsonant : 3\nNumber : 3', isHidden: false },
      { input: 'TCS IPA 2026', output: 'Vowel : 2\nConsonant : 4\nNumber : 4', isHidden: false },
      { input: 'A1E2I3O4U5', output: 'Vowel : 5\nConsonant : 0\nNumber : 5', isHidden: true }
    ]
  },
  // Tough SPQ - Palindrome
  {
    subject: 'Java',
    topic: 'Strings',
    questionType: 'SPQ',
    difficulty: 'Easy',
    question: 'Check Palindrome String',
    description: '### Scenario\nWrite a Java program to check if a given string is a palindrome or not.\n\n### Instructions\n- Read a string from standard input.\n- Print "Palindrome" if the string reads the same forwards and backwards.\n- Otherwise, print "None".\n- The check should be case-sensitive.',
    inputFormat: 'A single continuous string.',
    outputFormat: '"Palindrome" or "None".',
    sampleInput: 'pop',
    sampleOutput: 'Palindrome',
    constraints: '1 <= String length <= 1000',
    starterCode: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}',
    solution: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        boolean check = true;\n        for(int i=0; i<s.length(); i++) {\n            if(s.charAt(i) != s.charAt(s.length()-1-i)) {\n                check = false;\n                break;\n            }\n        }\n        if(check) System.out.println("Palindrome");\n        else System.out.println("None");\n    }\n}',
    testCases: [
      { input: 'pop', output: 'Palindrome', isHidden: false },
      { input: 'Papa', output: 'None', isHidden: false },
      { input: 'madam', output: 'Palindrome', isHidden: true },
      { input: 'hello', output: 'None', isHidden: true }
    ]
  }
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log('Inserting tough questions...');
    await Question.insertMany(toughQuestions);
    console.log(`Successfully seeded ${toughQuestions.length} tough questions.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

runSeed();
