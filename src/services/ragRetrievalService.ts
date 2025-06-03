import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

export interface RetrievedChunk {
  id: string;
  score: number;
  text: string;
}

export const retrieveSimilarContent = async (
  query: string,
  topK: number = 5
): Promise<RetrievedChunk[]> => {
  try {
    // Generate embedding for the query
    const embedding = await new OpenAIEmbeddings().embedQuery(query);

    // Query Pinecone for similar vectors
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    console.log("qres",queryResponse);

    // Transform the response into our desired format
    return queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score || 0,
      text: match.metadata?.text as string || '',
    }));
   
    
  } catch (error) {
    console.error('Error retrieving similar content:', error);
    throw new Error('Failed to retrieve similar content');
  }
};
