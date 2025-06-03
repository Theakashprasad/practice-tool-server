import { Request, Response } from 'express';
import { retrieveSimilarContent } from '../services/ragRetrievalService';

export const ragRetrieval = async (req: Request, res: Response) => {
  const { query, topK } = req.body;

  if (!query || typeof query !== 'string') {
     res.status(400).json({ error: 'Query is required and must be a string' });
     return
  }

  try {
    const results = await retrieveSimilarContent(query, topK);
    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error in searchSimilarContent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve similar content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 