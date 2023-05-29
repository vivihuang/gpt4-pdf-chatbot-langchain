export const getTodayStr = (defaultValue?: string) => defaultValue || new Date().toLocaleString('en-US', {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
});
