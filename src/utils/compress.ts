export const compressBlob = async (data: Blob): Promise<{
    size: number;
    content: Blob;
}> => {
    const compressStream = new CompressionStream('deflate-raw');

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
    let chunksSize = 0;
    const writeCompressedData: WritableStream<Blob> = new WritableStream({
        write: (chunk) => {
            chunks.push(chunk);
            chunksSize += chunk.size;
        }
    });

    // Pipe the streams
    await readable.pipeThrough(compressStream).pipeTo(writeCompressedData);

    // Return the compressed data
    return {
        size: chunksSize,
        content: new Blob(chunks),
    }
};
