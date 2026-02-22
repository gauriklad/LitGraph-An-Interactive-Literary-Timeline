//Cosine Similarity
//Compares two numerical DNA vectors or objects
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;

  // Convert Objects to Arrays if necessary (ensures consistent order)
  // Assumes keys are vocab, complexity, pacing, abstraction
  const toArray = (v) => Array.isArray(v) ? v : [v.vocab, v.complexity, v.pacing, v.abstraction];
  
  const a = toArray(vecA);
  const b = toArray(vecB);

  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = cosineSimilarity;