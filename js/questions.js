/*
 * Practice questions with worked answers.
 *
 * Each question has a stem (text plus an optional figure) and one or more
 * parts. A part holds the model answer, the mark points used to self-mark,
 * an explanation, common mistakes and, optionally, an interactive "Try it"
 * widget (named by `tryIt`, built in js/revision.js).
 *
 * Code answers give the same solution twice: `ref` in SQA Reference Language
 * and `py` in Python. Indent with two spaces (ref) or four spaces (py).
 */
(function () {
  'use strict';

  const proc = text => ({ t: 'process', text });
  const REPEAT = (body, cond) => ({ t: 'repeat', body, cond });

  window.QUESTIONS = [
    {
      id: 'q1',
      title: 'Rounding screen time',
      topic: 'Predefined functions',
      stem: '<p>The weekly average screen time use of a tablet is calculated and stored in the variable <code>screenTime</code>.</p>',
      parts: [{
        id: 'q1',
        prompt: 'Using a programming language of your choice, write the code to store this weekly average screen time to <strong>two decimal places</strong>.',
        marks: 2,
        code: {
          ref: ['SET screenTime TO ROUND(screenTime, 2)'],
          py: ['screenTime = round(screenTime, 2)']
        },
        markPoints: [
          'Uses the <strong>round</strong> function, with brackets',
          'Correct parameters: <code>screenTime</code> <em>and</em> <strong>2</strong>'
        ],
        why: `<p><code>ROUND</code> is a <strong>predefined function</strong>: a piece of code that is already built into the language. You give it two things (its <em>parameters</em>): the value to round and how many decimal places you want.</p>
          <p>The marks are for the function and its two parameters, so <code>ROUND(screenTime, 2)</code> is the key part. The question says <em>store</em>, though, so write a complete line that puts the result into a variable with <code>SET … TO</code> (or <code>=</code> in Python).</p>`,
        watch: [
          'Leaving out the brackets, or a parameter: <code>ROUND screenTime</code> or <code>ROUND(screenTime)</code> does not say how many decimal places.',
          'Putting the parameters the wrong way round, e.g. <code>ROUND(2, screenTime)</code>.',
          'Using <code>INT</code> / <code>int()</code>: that chops off <em>all</em> the decimal places instead of rounding to two.'
        ],
        tryIt: 'round'
      }]
    },

    {
      id: 'q2',
      title: 'Awarding a merit',
      topic: 'Logical operators',
      stem: '<p>The following code checks if a pupil will receive a merit.</p>',
      figure: {
        type: 'code', start: 34,
        lines: ['IF peerMentor = TRUE AND attendance > 95 THEN', '  SET merit TO "Yes"', 'END IF']
      },
      parts: [{
        id: 'q2a',
        label: '(a)',
        prompt: 'Identify the logical operator in this code.',
        marks: 1,
        answer: '<p class="answer-big"><code>AND</code></p>',
        markPoints: ['<code>AND</code>'],
        why: `<p>At National 5 there are three <strong>logical operators</strong>: <code>AND</code>, <code>OR</code> and <code>NOT</code>. They join or reverse <em>conditions</em>.</p>
          <p>Here <code>AND</code> joins two conditions, so <strong>both</strong> must be true for the pupil to get a merit: they must be a peer mentor <em>and</em> have attendance above 95.</p>`,
        watch: [
          '<code>=</code> and <code>&gt;</code> are <strong>comparison</strong> (relational) operators, not logical operators. They compare two values; they do not join conditions.',
          '"Identify" only needs the operator itself. You do not need to explain it.'
        ],
        tryIt: 'merit'
      }]
    },

    {
      id: 'q3',
      title: 'Iterative development',
      topic: 'Development process',
      stem: '',
      parts: [{
        id: 'q3',
        prompt: 'Describe a situation where an iterative approach is required during the software development process.',
        marks: 1,
        answer: '<p>During <strong>testing</strong>, the program gives a wrong result, so the programmer has to <strong>go back to the implementation stage</strong> to fix the code (and then test it again).</p>',
        also: `<p>Other situations that would get the mark:</p>
          <ul>
            <li>The client changes or adds a requirement part-way through, so the developer goes back to <strong>analysis</strong> (and then design).</li>
            <li>During implementation the programmer finds the design does not work, so they go back to <strong>design</strong>.</li>
            <li>The evaluation shows the program is not fit for purpose, so an earlier stage has to be revisited.</li>
          </ul>`,
        markPoints: ['Describes a <strong>specific</strong> situation (what went wrong) <em>and</em> the earlier stage that is returned to'],
        why: `<p><strong>Iterative</strong> means <em>repeating</em>. The software development process is not a straight line: the developer may need to go back to an earlier stage and work through the stages again.</p>
          <p>"Describe a situation" means you need a <em>reason</em>: say what happened and which stage the developer goes back to.</p>`,
        watch: [
          '"Going back to an earlier stage" on its own is just the definition of iterative. It does not describe a <em>situation</em>, so it gets no mark.',
          'Be specific: name the stage where the problem is found <em>and</em> the stage you return to.'
        ],
        tryIt: 'iterative'
      }]
    },

    {
      id: 'q4',
      title: 'To the power of',
      topic: 'Arithmetic operators',
      stem: '<p>Part of a program is shown below.</p>',
      figure: {
        type: 'code', start: 34,
        lines: ['RECEIVE xyz FROM (INTEGER) KEYBOARD', 'SET abc TO xyz ^ 2']
      },
      parts: [{
        id: 'q4a',
        label: '(a)',
        prompt: 'State the value stored in <code>abc</code> when ‘3’ is entered by the user at Line 34.',
        marks: 1,
        answer: '<p class="answer-big">9</p>',
        markPoints: ['9'],
        why: `<p><code>^</code> means <strong>to the power of</strong> (an exponent). <code>xyz ^ 2</code> means <em>xyz squared</em>, which is xyz × xyz.</p>
          <p>The user enters 3, so <code>abc</code> = 3 ^ 2 = 3 × 3 = <strong>9</strong>.</p>
          <p>In Python the same operator is written <code>**</code>, e.g. <code>abc = xyz ** 2</code>.</p>`,
        watch: [
          '<strong>6</strong> is wrong: that is 3 × 2, not 3 to the power of 2.',
          '<strong>32</strong> is wrong: <code>^</code> does not join the numbers together.'
        ],
        tryIt: 'power'
      }]
    },

    {
      id: 'q5',
      title: 'Creating a username',
      topic: 'Concatenation',
      stem: '<p>The program below issues customers with a username.</p>',
      figure: {
        type: 'code', start: 11,
        lines: [
          'RECEIVE firstName FROM (STRING) KEYBOARD',
          'RECEIVE yearOfBirth FROM (STRING) KEYBOARD',
          'SET userName TO firstName & yearOfBirth',
          'SEND userName TO DISPLAY'
        ]
      },
      parts: [{
        id: 'q5',
        prompt: 'Describe how the value assigned to the <code>userName</code> variable is created in Line 13.',
        marks: 1,
        answer: '<p>The value of <code>firstName</code> and the value of <code>yearOfBirth</code> are <strong>joined together</strong> (concatenated) to make one string. For example, <code>"Amy"</code> and <code>"2009"</code> become <code>"Amy2009"</code>.</p>',
        markPoints: ['Says that <code>firstName</code> and <code>yearOfBirth</code> are <strong>joined / concatenated</strong>'],
        why: `<p>The <code>&amp;</code> symbol is the <strong>concatenation</strong> operator in SQA Reference Language. Concatenation means joining strings end to end. (In Python you use <code>+</code> with two strings.)</p>
          <p>Notice that <code>yearOfBirth</code> was received as a <code>STRING</code>, so nothing is added up. The digits are just stuck on the end of the name.</p>`,
        watch: [
          '"It adds them" is too vague, and suggests arithmetic. Use the words <strong>join</strong> or <strong>concatenate</strong>.',
          'Mention <em>both</em> variables, and say which comes first if you can.'
        ],
        tryIt: 'concat'
      }]
    },

    {
      id: 'q6',
      title: 'Bus ticket booking',
      topic: 'Data types · random numbers',
      stem: '<p>A program is required for passengers to book a ticket on a bus.</p>',
      parts: [
        {
          id: 'q6a',
          label: '(a)',
          prompt: 'Passengers must enter their destination and their age when making a booking, as some will qualify for free travel. Complete the table below to state the most suitable data types that should be used.',
          table: {
            head: ['Variable name', 'Sample data', 'Data type'],
            rows: [['passengerAge', '78', '?'], ['destination', 'Ullapool', '?']]
          },
          marks: 2,
          answer: `<table class="q-table answer-table">
              <thead><tr><th>Variable name</th><th>Sample data</th><th>Data type</th></tr></thead>
              <tbody>
                <tr><td><code>passengerAge</code></td><td>78</td><td><strong>Integer</strong></td></tr>
                <tr><td><code>destination</code></td><td>Ullapool</td><td><strong>String</strong></td></tr>
              </tbody>
            </table>`,
          markPoints: ['<code>passengerAge</code>: <strong>integer</strong>', '<code>destination</code>: <strong>string</strong>'],
          why: `<p>The five data types at National 5 are <strong>character</strong>, <strong>string</strong>, <strong>integer</strong>, <strong>real</strong> and <strong>Boolean</strong>.</p>
            <ul>
              <li>An age is a <strong>whole number</strong>, so <em>integer</em> is the most suitable. <em>Real</em> would hold it, but an age never needs a decimal point.</li>
              <li>A place name is a sequence of characters (letters), so it is a <em>string</em>.</li>
            </ul>`,
          watch: [
            '"Number" and "text" are not data types. Use the proper names: integer, real, string.',
            '<em>Character</em> holds only <strong>one</strong> character, so it cannot store "Ullapool".'
          ],
          tryIt: 'types'
        },
        {
          id: 'q6b',
          label: '(b)',
          prompt: 'Write a line of code that will randomly allocate a seat number and store this in the variable <code>seatNum</code>. There are 50 seats available.',
          marks: 2,
          code: {
            ref: ['SET seatNum TO RANDOM(1, 50)'],
            py: ['import random', '', 'seatNum = random.randint(1, 50)']
          },
          markPoints: [
            '<strong>Assigns</strong> the value to <code>seatNum</code>',
            'A <strong>random</strong> function that generates <strong>50</strong> values (e.g. 1 to 50)'
          ],
          why: `<p><code>RANDOM(1, 50)</code> picks a random <strong>integer</strong> from 1 up to and including 50. Those are exactly the seat numbers on the bus.</p>
            <p>In Python, <code>random.randint(1, 50)</code> does the same job. It also includes both end values. You need <code>import random</code> at the top of the program.</p>`,
          watch: [
            '<code>RANDOM(0, 50)</code> gives 51 possible values, and there is no seat 0.',
            'In Python, <code>random.randrange(1, 50)</code> stops at <strong>49</strong>, so seat 50 would never be picked.',
            'Remember to <em>store</em> the number with <code>SET seatNum TO …</code>. Just writing <code>RANDOM(1, 50)</code> on its own does not assign it to <code>seatNum</code>, so a mark is lost.'
          ],
          tryIt: 'seat'
        }
      ]
    },

    {
      id: 'q7',
      title: 'Self-service till',
      topic: 'Design · loops · data types',
      stem: '<p>A new supermarket self-service till is being designed for customers. Part of the program design is shown below.</p>',
      figure: {
        type: 'flow',
        flow: [
          proc('add all items to conveyor belt'),
          REPEAT([proc('scan item'), proc('add item price to total')], 'is conveyor belt empty?'),
          proc('display total')
        ]
      },
      parts: [
        {
          id: 'q7a',
          label: '(a)',
          prompt: 'State the design technique shown above.',
          marks: 1,
          answer: '<p class="answer-big">Flowchart</p>',
          markPoints: ['Flowchart'],
          why: `<p>There are three design techniques at National 5:</p>
            <ul>
              <li><strong>Flowchart</strong>: symbols (boxes, diamonds) joined by arrows to show the flow through the program.</li>
              <li><strong>Structure diagram</strong>: boxes arranged in a tree, read top to bottom, left to right.</li>
              <li><strong>Pseudocode</strong>: numbered lines of structured English, close to code.</li>
            </ul>
            <p>The diamond decision symbol and the arrow looping back make this a flowchart.</p>`,
          watch: ['Do not answer "diagram" on its own. Name the technique exactly.']
        },
        {
          id: 'q7b',
          label: '(b)',
          prompt: 'State which type of loop is used in this design.',
          marks: 1,
          answer: '<p class="answer-big">Conditional loop</p>',
          markPoints: ['Conditional loop'],
          why: `<p>The loop keeps going <strong>until a condition is true</strong> (the conveyor belt is empty). The program does not know in advance how many items the customer has, so a <em>fixed</em> loop would not work.</p>
            <p>The condition is checked at the <strong>end</strong> of the loop, after an item is scanned. That matches a <code>REPEAT … UNTIL</code> loop:</p>
            <pre class="code-block"><code>REPEAT
  scan item
  add item price to total
UNTIL conveyor belt is empty</code></pre>`,
          watch: [
            '"Fixed loop" is wrong. A fixed loop repeats a set number of times, which we do not know here.',
            'Just "loop" or "repeat" is not enough. The type is <strong>conditional</strong>.'
          ],
          tryIt: 'belt'
        },
        {
          id: 'q7c',
          label: '(c)',
          prompt: 'State the most suitable data type for the variable that will be used in the ‘is conveyor belt empty?’ step.',
          marks: 1,
          answer: '<p class="answer-big">Boolean</p>',
          markPoints: ['Boolean'],
          why: `<p>The question “is conveyor belt empty?” only ever has <strong>two possible answers</strong>: yes or no. A <strong>Boolean</strong> variable holds exactly two values, <code>TRUE</code> or <code>FALSE</code>, so it is the best fit, e.g. <code>beltEmpty = TRUE</code>.</p>`,
          watch: ['A string holding "yes" / "no" would work, but it is not the <em>most suitable</em> data type, so it gets no mark.']
        }
      ]
    },

    {
      id: 'q8',
      title: 'Luna Life animation cost',
      topic: 'Selection · implementation',
      stem: `<p>Luna Life uses a program to calculate the cost of creating an animation. Part of the program is shown below.</p>
        <pre class="code-block"><code>SET basicCost TO timeInSeconds * animatorCharge</code></pre>
        <p>After the basic cost has been calculated, the following discounts can be applied to animations depending on their use:</p>
        <ul><li>education: deduct £20 from cost</li><li>charity: deduct £30 from cost</li></ul>`,
      parts: [{
        id: 'q8',
        prompt: 'Using a programming language of your choice, write the code to ask for the purpose of the animation, calculate any discount, and display the final cost in the variable <code>finalCost</code>.',
        marks: 4,
        code: {
          ref: [
            'SEND "What is the purpose of the animation?" TO DISPLAY',
            'RECEIVE purpose FROM (STRING) KEYBOARD',
            'IF purpose = "education" THEN',
            '  SET finalCost TO basicCost - 20',
            'ELSE IF purpose = "charity" THEN',
            '  SET finalCost TO basicCost - 30',
            'ELSE',
            '  SET finalCost TO basicCost',
            'END IF',
            'SEND finalCost TO DISPLAY'
          ],
          py: [
            'purpose = input("What is the purpose of the animation? ")',
            'if purpose == "education":',
            '    finalCost = basicCost - 20',
            'elif purpose == "charity":',
            '    finalCost = basicCost - 30',
            'else:',
            '    finalCost = basicCost',
            'print("Final cost: £", finalCost)'
          ]
        },
        markPoints: [
          'Asks for and <strong>receives the purpose</strong> from the keyboard',
          'Uses <strong>selection</strong> (<code>IF</code>) with the conditions for <em>education</em> and <em>charity</em>',
          'Correct calculations: <strong>subtract 20</strong> for education and <strong>subtract 30</strong> for charity, stored in <code>finalCost</code>',
          '<strong>Displays</strong> <code>finalCost</code>, which also has a value when there is no discount'
        ],
        why: `<p>Break the question into its three jobs and write code for each:</p>
          <ol>
            <li><strong>Ask for the purpose</strong>: input with <code>RECEIVE</code> (<code>input()</code> in Python).</li>
            <li><strong>Calculate any discount</strong>: <em>selection</em> chooses which calculation to do. Use <code>ELSE IF</code> (<code>elif</code>) because an animation is for education <em>or</em> charity, not both.</li>
            <li><strong>Display the final cost</strong>: output <code>finalCost</code> after the <code>IF</code> has finished.</li>
          </ol>
          <p>The word “<em>any</em> discount” is a clue that some animations get <strong>no</strong> discount. The <code>ELSE</code> branch makes sure <code>finalCost</code> still gets a value (the basic cost) in that case.</p>`,
        also: `<p>Setting <code>finalCost</code> to the basic cost <em>first</em> and then subtracting is also correct:</p>
          <pre class="code-block"><code>RECEIVE purpose FROM (STRING) KEYBOARD
SET finalCost TO basicCost
IF purpose = "education" THEN
  SET finalCost TO finalCost - 20
END IF
IF purpose = "charity" THEN
  SET finalCost TO finalCost - 30
END IF
SEND finalCost TO DISPLAY</code></pre>`,
        watch: [
          'Forgetting the no-discount case: if <code>finalCost</code> is only set inside the <code>IF</code>, it has no value for other purposes.',
          'Displaying <code>basicCost</code> instead of <code>finalCost</code>.',
          'Writing <code>purpose = education</code> with no quotation marks. <code>"education"</code> is a string, so it needs quotes.',
          'In Python, use <code>==</code> to compare. A single <code>=</code> assigns a value.'
        ],
        tryIt: 'luna'
      }]
    },

    {
      id: 'q9',
      title: 'Gift card top-up',
      topic: 'Analysis · input validation',
      stem: `<p>A program is being written that will allow gamers to add money to their account using gift cards (for example, a £25 gift card with the number 0976 3421 6475 4377).</p>
        <p>The program asks the user to enter their username, their five-character password and the gift card number. The updated balance in the user’s account is then displayed.</p>`,
      parts: [
        {
          id: 'q9a',
          label: '(a)',
          prompt: 'Identify three processes that will be carried out by the program.',
          table: {
            head: null,
            rows: [['Input(s)', 'Username, password, gift card number'], ['Process(es)', '?'], ['Output(s)', 'Display new balance']]
          },
          marks: 3,
          answer: `<p>Any <strong>three</strong> of:</p>
            <ul>
              <li>Validate the password length is 5</li>
              <li>Validate the gift card number</li>
              <li>Check the username exists</li>
              <li>Check the gift card number exists</li>
              <li>Check the password entered is correct (matches the user’s password)</li>
              <li>Calculate / update the new balance</li>
            </ul>`,
          markPoints: ['First correct process', 'Second correct process', 'Third correct process'],
          why: `<p>This is <strong>analysis</strong>: working out the <em>inputs</em>, <em>processes</em> and <em>outputs</em> of a program.</p>
            <ul>
              <li><strong>Inputs</strong>: data that goes <em>into</em> the program (already given).</li>
              <li><strong>Processes</strong>: what the program <em>does with</em> the data: checking, calculating, comparing.</li>
              <li><strong>Outputs</strong>: what comes <em>out</em> (already given).</li>
            </ul>
            <p>Start each process with a verb like <em>check</em>, <em>validate</em>, <em>calculate</em> or <em>add</em>.</p>`,
          watch: [
            '“Enter username” is an <strong>input</strong>, and “display balance” is an <strong>output</strong>. Neither counts as a process.',
            'Three different processes are needed. Checking the username and checking the password are two separate processes.'
          ],
          tryIt: 'ipo'
        },
        {
          id: 'q9b',
          label: '(b)',
          prompt: 'Using a programming language of your choice, write the input validation code to confirm that the password entered has five characters.',
          marks: 4,
          code: {
            ref: [
              'RECEIVE password FROM (STRING) KEYBOARD',
              'WHILE LENGTH(password) <> 5 DO',
              '  SEND "Password must be five characters. Please re-enter." TO DISPLAY',
              '  RECEIVE password FROM (STRING) KEYBOARD',
              'END WHILE'
            ],
            py: [
              'password = input("Enter your password: ")',
              'while len(password) != 5:',
              '    print("Password must be five characters. Please re-enter.")',
              '    password = input("Enter your password: ")'
            ]
          },
          markPoints: [
            'Uses a <strong>conditional loop</strong> (<code>WHILE</code> or <code>REPEAT … UNTIL</code>)',
            'Correct loop condition: the loop only ends when the password <strong>length = 5</strong>',
            'Password <strong>input</strong> assigned <strong>inside</strong> the loop',
            '<strong>Error message</strong> inside the loop'
          ],
          why: `<p><strong>Input validation</strong> is a standard algorithm. It keeps asking until the data is acceptable. The pattern is always:</p>
            <ol>
              <li>Get the input.</li>
              <li><strong>While</strong> the input is <em>invalid</em>: show an error and get the input again.</li>
            </ol>
            <p><code>LENGTH(password)</code> (<code>len()</code> in Python) is a predefined function that returns the number of characters in a string. The loop condition is the <strong>invalid</strong> case, so it uses <code>&lt;&gt;</code> (not equal to, written <code>!=</code> in Python).</p>`,
          also: `<p>A <code>REPEAT … UNTIL</code> loop is also correct. Here the condition is the <strong>valid</strong> case, and the error message <strong>must</strong> sit inside a correct <code>IF</code>. Otherwise it would show even when the password is right:</p>
            <pre class="code-block"><code>REPEAT
  RECEIVE password FROM (STRING) KEYBOARD
  IF LENGTH(password) &lt;&gt; 5 THEN
    SEND "Password must be five characters." TO DISPLAY
  END IF
UNTIL LENGTH(password) = 5</code></pre>`,
          watch: [
            'Using <code>IF</code> instead of a loop only checks <strong>once</strong>, so a second wrong password would get through. With no loop, the most you can get is <strong>1 mark</strong> (for the error message with a correct condition).',
            'Writing the condition the wrong way round: <code>WHILE LENGTH(password) = 5</code> loops when the password is <em>valid</em>.',
            'Forgetting to receive the password again inside the loop creates an <strong>infinite loop</strong>.'
          ],
          tryIt: 'password'
        }
      ]
    }
  ];
})();
