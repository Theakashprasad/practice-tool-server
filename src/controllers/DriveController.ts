import { Request, Response } from 'express';
import { listDriveFiles, downloadFileContent } from '../services/googleDriveService';
import { upsertToPinecone } from '../services/vectordbService';

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

/**
 * Split long text into smaller chunks of ~700 words for embedding
 */
const splitTextIntoChunks = (text: string, maxTokens = 7000): string[] => {
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;
  
  const words = text.split(/\s+/);
  
  for (const word of words) {
    const wordTokens = estimateTokens(word);
    
    if (currentTokens + wordTokens > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
    }
    
    currentChunk += word + ' ';
    currentTokens += wordTokens;
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

/**
 * Controller to scan a file from Google Drive and ingest it into Pinecone
 */
export const scanAndIngest = async (req: Request, res: Response) => {
  const { fileId } = req.body;

  if (!fileId) {
     res.status(400).json({ error: 'Missing fileId in request body.' });
     return
  }

  try {
    const content = await downloadFileContent(fileId);
    if (!content || typeof content !== 'string') {
      throw new Error('Downloaded file content is empty or invalid.');
    }

    const totalTokens = estimateTokens(content);
    if (totalTokens > 100000) { // Arbitrary large limit to prevent memory issues
      throw new Error(`File is too large (${totalTokens} tokens). Maximum supported size is 100,000 tokens.`);
    }

    const chunks = splitTextIntoChunks(content);

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${fileId}_chunk_${i}`;
      await upsertToPinecone(chunkId, chunks[i]);
    }

    res.status(200).json({ message: `File ${fileId} ingested successfully with ${chunks.length} chunks.` });
  } catch (err) {
    console.error('Ingestion error:', err);
    res.status(500).json({ error: `Failed to ingest file ${fileId}.`, details: err instanceof Error ? err.message : err });
  }
};
