import { Document } from 'langchain/document';

export type Message = {
	type: 'apiMessage' | 'userMessage';
	message: string;
	isStreaming?: boolean;
	sourceDocs?: Document[];
	chartData?: { title: string, labels: string[], data: number[] }
};
