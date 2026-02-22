//Literary DNA Extraction
//Converts raw text into stylometric features (0-100 Scale)
function extractDNA(text) {
  if (!text || typeof text !== "string") {
    return { vocab: 0, complexity: 0, pacing: 0, abstraction: 0 };
  }

  // 1. Normalize
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s.!?]/g, "");

  // 2. Tokenize
  const words = cleanText.match(/\b[a-z]+\b/g) || [];
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

  if (words.length === 0) return { vocab: 0, complexity: 0, pacing: 0, abstraction: 0 };

  //METRIC 1: VOCABULARY (Type-Token Ratio)
  // Scale: Direct Percentage
  const uniqueWords = new Set(words);
  let vocab = (uniqueWords.size / words.length) * 100;
  // Adjustment: Short texts artificially inflate TTR, so we dampen slightly for very short texts
  if (words.length < 50) vocab *= 0.8;

  //METRIC 2: COMPLEXITY (Avg Sentence Length)
  // Scale: Map 0-40 words/sentence to 0-100 score
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const complexity = Math.min((avgSentenceLength / 30) * 100, 100);

  //METRIC 3: PACING (Sentence Length Variation)
  // Scale: Standard Deviation. Map 0-15 deviation to 0-100 score
  const variance = sentences.reduce((sum, sentence) => {
    const len = (sentence.match(/\b[a-z]+\b/g) || []).length;
    return sum + Math.pow(len - avgSentenceLength, 2);
  }, 0) / Math.max(sentences.length, 1);
  
  const stdDev = Math.sqrt(variance);
  const pacing = Math.min((stdDev / 15) * 100, 100);

  //METRIC 4: ABSTRACTION (Abstract Noun Usage)
  // Expanded list + Suffix check
  const abstractSuffixes = ["tion", "ism", "ity", "ment", "ness", "ance", "ence"];
  const commonAbstractWords = [
    "idea", "thought", "emotion", "freedom", "belief", "power", "justice", 
    "truth", "memory", "society", "reason", "nature", "love", "time", 
    "life", "soul", "art", "world", "wisdom", "fear", "hope"
  ];

  let abstractCount = 0;
  words.forEach(w => {
    if (commonAbstractWords.includes(w)) {
      abstractCount++;
    } else if (w.length > 5 && abstractSuffixes.some(s => w.endsWith(s))) {
      // Heuristic: words ending in -tion, -ism often abstract
      abstractCount++;
    }
  });

  // Scale: Abstraction is rare. 10% usage is very high.
  // We multiply the raw ratio by 10 to map 0-10% usage to 0-100 score.
  const abstraction = Math.min((abstractCount / words.length) * 100 * 8, 100);

  return {
    vocab: Math.round(vocab),
    complexity: Math.round(complexity),
    pacing: Math.round(pacing),
    abstraction: Math.round(abstraction)
  };
}

module.exports = extractDNA;