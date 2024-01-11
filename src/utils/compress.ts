export const compressBlob = async (data: Blob): Promise<Blob> => {
    const compressStream = new CompressionStream('gzip');

    // Create readable stream from blob
    const readable = new ReadableStream({
        start: (controller) => {
            const reader = new FileReader();
            reader.onload = e => {
                if (e.target?.result) {
                    controller.enqueue(e.target.result);
                }

                controller.close();
            }

            reader.readAsArrayBuffer(data);
        }
    });

    // Extract the compressed data
    const chunks: Blob[] = [];
    const writeCompressedData: WritableStream<Blob> = new WritableStream({
        write: (chunk) => {
            chunks.push(chunk);
        }
    });

    // Pipe the streams
    await readable.pipeThrough(compressStream).pipeTo(writeCompressedData);

    // Return the compressed data
    return new Blob(chunks);
};
