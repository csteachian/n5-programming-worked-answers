# N5 Programming Worked Answers

An interactive revision page for National 5 Computing Science (Software Design and Development). It goes through a set of programming practice questions (9 questions, 24 marks) with worked answers that follow the official marking scheme.

## Using it

Open `index.html` in a browser. No server, build step or install is needed. Pushing to `main` publishes the site with GitHub Pages (Settings → Pages → Source: *GitHub Actions*).

For each part of a question, students:

- write their own answer first (saved in the browser)
- press **Show answer** to see the model answer, in SQA Reference Language or Python (toggle at the top)
- tick the mark points they earned. A running total shows in the header.
- read **Why?** (the explanation) and **Watch out** (common mistakes)
- use **Try it** to experiment: e.g. trace the till loop step by step, run the Luna Life code with different purposes, or enter passwords into the validation loop

Answers and ticks are saved in the browser's local storage only.

## Files

- `index.html`: page structure
- `css/styles.css`: shared tokens, layout and buttons (light and dark themes)
- `css/revision.css`: question cards, answer blocks and Try it activities
- `js/flowchart.js`: draws flowcharts as SVG
- `js/questions.js`: questions, model answers, mark points and explanations
- `js/revision.js`: revealing, self-marking, saving and the Try it activities
