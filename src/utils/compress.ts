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
    let chunksSize = 0;
    const chunks: Uint8Array[] = [];
    const writeCompressedData: WritableStream<Uint8Array> = new WritableStream({
        write: (chunk: Uint8Array) => {
            chunks.push(chunk);
            chunksSize += chunk.length;
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
