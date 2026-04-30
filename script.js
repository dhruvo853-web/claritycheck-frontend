const BACKEND_URL = "https://claritycheck-backend-m6i4.vercel.app/api/proofread";

const writingInput = document.getElementById("writingInput");
const writingType = document.getElementById("writingType");
const toneType = document.getElementById("toneType");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const scoreDisplay = document.getElementById("scoreDisplay");
const verdictDisplay = document.getElementById("verdictDisplay");
const meterFill = document.getElementById("meterFill");

const wordCountEl = document.getElementById("wordCount");
const sentenceCountEl = document.getElementById("sentenceCount");
const readTimeEl = document.getElementById("readTime");

const grammarFeedback = document.getElementById("grammarFeedback");
const clarityFeedback = document.getElementById("clarityFeedback");
const toneFeedback = document.getElementById("toneFeedback");
const structureFeedback = document.getElementById("structureFeedback");
const improvedText = document.getElementById("improvedText");

const copyBtn = document.getElementById("copyBtn");
const badEmailSample = document.getElementById("badEmailSample");
const goodEmailSample = document.getElementById("goodEmailSample");
const essaySample = document.getElementById("essaySample");

function countWords(text) {
  const words = text.trim().match(/\b[\w']+\b/g);
  return words ? words.length : 0;
}

function countSentences(text) {
  const sentences = text.trim().match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.length : text.trim() ? 1 : 0;
}

function getVerdictColor(score) {
  if (score >= 90) return "#bbf7d0";
  if (score >= 75) return "#bfdbfe";
  if (score >= 50) return "#fde68a";
  if (score >= 30) return "#fed7aa";
  return "#fecaca";
}

function updateStatsOnly() {
  const text = writingInput.value;
  const words = countWords(text);
  const sentences = countSentences(text);
  const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  wordCountEl.textContent = words;
  sentenceCountEl.textContent = sentences;
  readTimeEl.textContent = readingTime + " min";
}

function resetOutput() {
  scoreDisplay.textContent = "--";
  verdictDisplay.textContent = "Paste writing to begin";
  verdictDisplay.style.color = "#bfdbfe";
  meterFill.style.width = "0%";

  grammarFeedback.textContent = "Paste something first so ClarityCheck can analyze it.";
  clarityFeedback.textContent = "No writing analyzed yet.";
  toneFeedback.textContent = "No writing analyzed yet.";
  structureFeedback.textContent = "No writing analyzed yet.";
  improvedText.textContent = "Your improved version will appear here.";
}

async function analyzeWritingWithAI() {
  const text = writingInput.value.trim();

  if (!text) {
    resetOutput();
    updateStatsOnly();
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  scoreDisplay.textContent = "...";
  verdictDisplay.textContent = "AI is checking it...";
  verdictDisplay.style.color = "#bfdbfe";
  meterFill.style.width = "15%";

  grammarFeedback.textContent = "Checking grammar...";
  clarityFeedback.textContent = "Checking clarity...";
  toneFeedback.textContent = "Checking tone...";
  structureFeedback.textContent = "Checking structure...";
  improvedText.textContent = "Creating cleaner version...";

  updateStatsOnly();

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        writingType: writingType.value,
        tone: toneType.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "AI request failed");
    }

    const score = Number(data.score);

    scoreDisplay.textContent = score;
    verdictDisplay.textContent = data.verdict;
    verdictDisplay.style.color = getVerdictColor(score);
    meterFill.style.width = score + "%";

    grammarFeedback.textContent = data.grammar;
    clarityFeedback.textContent = data.clarity;
    toneFeedback.textContent = data.tone;
    structureFeedback.textContent = data.structure;
    improvedText.textContent = data.rewrite;
  } catch (error) {
    scoreDisplay.textContent = "!";
    verdictDisplay.textContent = "Error";
    verdictDisplay.style.color = "#fecaca";
    meterFill.style.width = "0%";

    grammarFeedback.textContent = "Something went wrong.";
    clarityFeedback.textContent = "Check that the backend URL is correct.";
    toneFeedback.textContent = "Make sure the backend has a working OpenAI API key and credits.";
    structureFeedback.textContent = error.message;
    improvedText.textContent = "No rewrite available because the AI request failed.";
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze Writing";
}

analyzeBtn.addEventListener("click", analyzeWritingWithAI);

clearBtn.addEventListener("click", function () {
  writingInput.value = "";
  resetOutput();
  updateStatsOnly();
});

copyBtn.addEventListener("click", function () {
  const text = improvedText.textContent;
  navigator.clipboard.writeText(text);

  copyBtn.textContent = "Copied!";
  setTimeout(function () {
    copyBtn.textContent = "Copy";
  }, 1200);
});

badEmailSample.addEventListener("click", function () {
  writingType.value = "Email";
  toneType.value = "Professional";
  writingInput.value =
    "dear mrs ayoubi\n\n" +
    "grade my test now because this is taking forever and i need my grade fixed today. i dont know why it still isnt done.\n\n" +
    "-dhruv";
  analyzeWritingWithAI();
});

goodEmailSample.addEventListener("click", function () {
  writingType.value = "Email";
  toneType.value = "Professional";
  writingInput.value =
    "Dear Mrs. Ayoubi,\n\n" +
    "I hope you are doing well. I wanted to ask if you would be able to grade my test when you have the chance. I would really appreciate it.\n\n" +
    "Thank you for your time.\n\n" +
    "Best,\n" +
    "Dhruv";
  analyzeWritingWithAI();
});

essaySample.addEventListener("click", function () {
  writingType.value = "Essay";
  toneType.value = "Academic";
  writingInput.value =
    "Social media can affect students in many ways. It can be helpful because people can communicate, learn new information, and stay connected with others. However, it can also hurt students when they compare themselves to others or spend too much time scrolling. Overall, students should use social media carefully because it can affect both focus and confidence.";
  analyzeWritingWithAI();
});

writingInput.addEventListener("input", updateStatsOnly);

resetOutput();
updateStatsOnly();
