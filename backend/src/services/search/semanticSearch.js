const { pipeline } = require('@xenova/transformers');

class SemanticSearch {
  constructor() {
    this.extractor = null;
    this.initPromise = this.init();
  }

  async init() {
    // Dynamically load xenova env
    const { env } = require('@xenova/transformers');
    env.localModelPath = './models';
    env.allowRemoteModels = true; // allow downloading if not present locally
    
    // Load feature-extraction pipeline
    this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[Semantic Search] Embeddings model loaded successfully.');
  }

  async generateEmbedding(text) {
    if (!text) return [];
    await this.initPromise; // Ensure model is loaded
    
    // Output shape: [1, seq_length, 384] -> pooling -> [1, 384]
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export singleton instance
module.exports = new SemanticSearch();
