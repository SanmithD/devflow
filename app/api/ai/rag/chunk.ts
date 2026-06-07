
export const chunkText = (text: string, chunkSize: number, overlap = 200) => {
    const chunks: string[] = [];

    let start = 0;

    while(start < text.length){
        const end = start + chunkSize;
        chunks.push(text.slice(start, end));

        start += chunkSize - overlap; // for context
    }

    return chunks;
}