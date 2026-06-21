const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeDocument = async (text, settings = {}) => {
  // Map settings UI text to Groq model ID
  let modelStr = 'llama-3.1-8b-instant';
  const rawModel = settings.model || 'Groq • llama-3.3-70b';
  if (rawModel.includes('mixtral')) modelStr = 'mixtral-8x7b-32768';
  else if (rawModel.includes('3.3-70b')) modelStr = 'llama-3.3-70b-versatile';
  else if (rawModel.includes('3.1-70b')) modelStr = 'llama-3.1-70b-versatile';

  const temperature = settings.temperature !== undefined ? settings.temperature : 0.1;

  const systemPrompt = `You are a data extraction API for MemoryVault. 
Your ONLY job is to output a strictly valid JSON object matching the requested schema.
NEVER output raw text, markdown blocks, or bullet points outside the JSON.
Escape all string characters properly.

Use this EXACT JSON format:
{
  "documentType": "Resume",
  "summary": "Example summary",
  "tags": ["Tag1"],
  "dates": ["2026-06-20"],
  "timelineEvents": [{"title": "Event", "date": "2026-06-20", "category": "Other", "priority": "medium"}],
  "companies": ["Company"],
  "salaries": [],
  "importantEntities": ["Entity"],
  "isImportant": true,
  "metadata": {}
}`;

  const userPrompt = `Analyze the following document text and extract the key information into a JSON object.

Extract the following fields and ensure every field is formatted strictly as requested:
- "documentType": A short category string (e.g. "Placement Notice", "Identity", "Bill", "Offer Letter", "Resume", "Screenshot", "Certificate")
- "summary": A concise 1-3 line summary of the document.
- "tags": Array of 3-5 relevant string tags (e.g. ["Nokia", "Placement", "Deadline"]).
- "dates": Array of important dates found in the document (YYYY-MM-DD or readable format).
- "timelineEvents": ${settings.extractDates !== false ? `Array of specific timeline events. Each event should be an object: {"title": "Short event title", "date": "YYYY-MM-DD", "category": "One of: Identity, Education, Finance, Bills, Placements, Jobs, Internships, Travel, Personal, Other", "priority": "One of: high, medium, low"}. If a doc implies multiple events (e.g. Deadline AND Interview), create multiple events. Deadlines/Interviews/Bills are 'high'. Do not hallucinate dates.` : `[] (Return an empty array, as date extraction is disabled by the user)`}
- "companies": Array of company or organization names.
- "salaries": Array of salary/CTC figures found.
- "importantEntities": Array of key entities (names of people, products, etc.).
- "isImportant": Boolean, true if it's a vital document (Identity, Offer Letter, crucial Bill).
- "metadata": An object of key-value pairs for other specific structured data.

Document Text:
${text.substring(0, 4000)}
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelStr,
      max_tokens: 4096,
      temperature: temperature
    });

    const resultString = response.choices[0]?.message?.content || '';
    
    // Extract JSON block if wrapped in markdown
    let jsonStr = resultString;
    const jsonMatch = resultString.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Find first { and last }
      const firstBrace = resultString.indexOf('{');
      const lastBrace = resultString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = resultString.substring(firstBrace, lastBrace + 1);
      }
    }

    const resultJson = JSON.parse(jsonStr);
    return resultJson;
  } catch (error) {
    console.error('Groq AI Error:', error);
    // Return a graceful fallback if AI fails
    return {
      documentType: "Uncategorized",
      summary: "AI processing failed or document contained no readable text.",
      tags: ["Uncategorized"],
      dates: [],
      timelineEvents: [],
      companies: [],
      salaries: [],
      importantEntities: [],
      isImportant: false,
      metadata: {}
    };
  }
};
