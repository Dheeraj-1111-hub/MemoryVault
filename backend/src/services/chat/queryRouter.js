const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.routeQuery = async (question) => {
  // A fast check to see if we can do a direct DB lookup or if we need synthesis
  // e.g. "Find my PAN card" -> direct_search (no synthesis needed)
  // "When is my Nokia interview?" -> synthesis (needs reading)
  const qLower = question.toLowerCase();

  // Simple heuristics for fast bypassing
  if (/show (me )?(my )?(pan|aadhaar|resume|passport)/.test(qLower)) return { type: 'direct_search' };
  if (/find (my )?(latest )?(bill|receipt|offer)/.test(qLower)) return { type: 'direct_search' };
  if (/upcoming deadlines/.test(qLower)) return { type: 'direct_search', intent: 'deadlines' };
  if (/pay attention to|reminders|notifications|missing/.test(qLower)) return { type: 'direct_search', intent: 'notifications' };

  // Fallback to AI routing for more complex decisions if needed
  try {
    const prompt = `Classify this user query into one of two categories:
    "direct_search": User just wants to see a specific document or list of documents (e.g. "Show my PAN card", "Find my resume")
    "synthesis": User is asking a question that requires reading and extracting facts from documents (e.g. "When is my interview?", "What is my salary?", "How many rounds?")
    
    Query: "${question}"
    
    Return ONLY JSON: {"type": "direct_search" | "synthesis"}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { type: result.type || 'synthesis' };
  } catch (error) {
    return { type: 'synthesis' }; // Default to full RAG
  }
};
