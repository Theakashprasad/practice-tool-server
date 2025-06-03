import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { OpenAIEmbeddings } from '@langchain/openai';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

export const upsertToPinecone = async (id: string, text: string) => {
  const embedding = await new OpenAIEmbeddings().embedQuery(text);
  await index.upsert([{ 
    id, 
    values: embedding,
    metadata: { text }
  }]);
};
