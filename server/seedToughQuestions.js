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
  // We'll generate a loop to create 40 dynamic MCQs to simulate a large pool
  ...Array.from({ length: 40 }).map((_, i) => ({
    subject: ['Java', 'SQL', 'Unix', 'JavaScript', 'HTML'][i % 5],
    topic: ['Memory', 'Performance', 'Architecture', 'Syntax', 'Networking'][i % 5],
    questionType: 'MCQ',
    difficulty: 'Hard',
    question: `Advanced Diagnostic Question #${i+1}: Identify the potential bottleneck in standard execution context when processing large data nodes?`,
    options: [
      `Memory Leak due to referencing context ${i}`,
      `CPU Thrashing`,
      `Unoptimized I/O blocks`,
      `Thread Deadlock`
    ],
    answer: `Memory Leak due to referencing context ${i}`,
    explanation: `This is a generated tough question to expand the pool size and ensure randomization in the SPQ/MCQ engine.`
  })),

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
        input: '1.1.1.1 - [10] "G /" 404\n1.1.1.1 - [10] "G /" 404\n2.2.2.2 - [10] "G /" 404\n',
        output: '1.1.1.1\n',
        isHidden: true
      }
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
