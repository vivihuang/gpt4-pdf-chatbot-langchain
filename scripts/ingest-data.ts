import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChromaClient } from 'chromadb'
import { Chroma } from 'langchain/vectorstores/chroma';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { CHROMA_NAME_SPACE } from '@/config/chroma';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import initEmbeddings from "@/utils/embeddings";

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async () => {
	try {
		/*load raw docs from the all files in the directory */
		const directoryLoader = new DirectoryLoader(filePath, {
			'.pdf': (path) => new CustomPDFLoader(path),
		});

		// const loader = new PDFLoader(filePath);
		const rawDocs = await directoryLoader.load();

		/* Split text into chunks */
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const docs = await textSplitter.splitDocuments(rawDocs);
		console.log('split docs');

		console.log('creating vector store...');

		const client = new ChromaClient();

		const collection = await client.getOrCreateCollection({ name: CHROMA_NAME_SPACE })
		console.log('collection for ', CHROMA_NAME_SPACE, collection)

		//embed the PDF documents
		const vectorStore = await Chroma.fromDocuments(docs, initEmbeddings(), {
			collectionName: CHROMA_NAME_SPACE,
		});

		const response = await vectorStore.similaritySearch("hello", 1);
		console.log(response);
	} catch (error) {
		// @ts-ignore
		const { response } = error || {}
		console.log('error', response || error);
		throw new Error('Failed to ingest your data');
	}
};

(async () => {
	try {
		await run();
		console.log('ingestion complete');
	} catch (e) {
		console.error(e);
	}
})();
