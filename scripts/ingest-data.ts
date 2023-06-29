import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch';
import { Document } from 'langchain/document'
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import initEmbeddings from "@/utils/embeddings";
import initOpenSearchClient from "@/utils/openSearchClient";
import { VECTOR_DB_NAME_SPACE } from "@/config/vectorDB";

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
		const formatDocs: Document[] = docs.map(item => ({
			pageContent: item.pageContent, metadata: {
				source: item.metadata.source,
				pdfTotalPages: item.metadata.pdf_numpages,
				linesFrom: item.metadata.loc.lines.from,
				linesTo: item.metadata.loc.lines.from,
			}
		}))
		console.log('split docs');

		console.log('init client');

		const client = initOpenSearchClient()
		console.log('creating vector store...');

		// embed the PDF documents
		const vectorStore = await OpenSearchVectorStore.fromDocuments(formatDocs, initEmbeddings(), {
			client,
			indexName: VECTOR_DB_NAME_SPACE,
		});

		const response = await vectorStore.similaritySearch("PMI", 1);
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
