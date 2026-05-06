
export function createTextStream(text: string, abortSignal?: AbortSignal): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const chunkSize = 5;
            for (let i = 0; i < text.length; i += chunkSize) {
                if (abortSignal?.aborted) {
                    controller.close();
                    return;
                }
                controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
            controller.close();
        },
    });
}