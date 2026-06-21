const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateAnswer = async (question, contextString, retrievedDocs, settings = {}) => {
  // Map settings UI text to Groq model ID
  let modelStr = 'llama-3.3-70b-versatile';
  const rawModel = settings.model || 'Groq • llama-3.3-70b';
  if (rawModel.includes('mixtral')) modelStr = 'mixtral-8x7b-32768';
  else if (rawModel.includes('3.1-70b') || rawModel.includes('3.3-70b')) modelStr = 'llama-3.3-70b-versatile';

  const temperature = settings.temperature !== undefined ? settings.temperature : 0.1;

  const prompt = `You are MemoryVault, an intelligent assistant for the user's personal document vault.
Your goal is to answer the user's question USING ONLY the provided documents in the context.

Rules:
1. If the answer is not contained in the documents, state clearly that you cannot find the information in their vault. Do NOT hallucinate.
2. If you answer using a document, you MUST include its ID in the sources array.
3. Keep the answer concise and direct.
4. Calculate a confidence score (0-100) based on how explicitly the document answers the question.
5. Generate 2 to 3 smart follow-up questions the user might want to ask next based on the answer.

Context:
${contextString}

Question:
"${question}"

Return ONLY a valid JSON object matching this schema:
{
  "answer": "Your detailed answer here...",
  "confidence": 95,
  "sources": [
    { "documentId": "document_id_here", "title": "Document Title" }
  ],
  "followUps": ["Follow up question 1?", "Follow up question 2?"]
}
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: modelStr,
      temperature: temperature,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Add file kind to sources for UI icons
    if (result.sources && Array.isArray(result.sources)) {
      result.sources = result.sources.map(src => {
        const matchingDoc = retrievedDocs.find(d => d._id.toString() === src.documentId);
        return {
          ...src,
          kind: matchingDoc ? matchingDoc.kind : 'pdf'
        };
      });
    }

    return result;
  } catch (error) {
    console.error("Answer Generation Error:", error);
    return {
      answer: "I encountered an error trying to analyze your documents.",
      confidence: 0,
      sources: [],
      followUps: []
    };
  }
};
