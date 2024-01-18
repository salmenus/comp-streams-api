import {compressBlob} from '../../utils/compress.ts';

export const compressLocalFile = async (content: string, isBase64: boolean): Promise<{
    size: number;
    content: Uint8Array;
}> => {
    let contentToCompress = content;
    if (isBase64) {
        const c = content.split(';base64,')[1];
        contentToCompress = atob(c);
    }

    const contentAsBlog = new Blob([contentToCompress]);

    const {
        size: compressedSize,
        content: compressedContent
    } = await compressBlob(contentAsBlog);

    console.log('---');
    console.log('Compressed String Content Length: ' + compressedSize);
    console.log('Compression Ratio: ' + (compressedSize / contentToCompress.length) * 100);
    console.log('---');

    const compressedContentAsUint8Array = new Uint8Array(await compressedContent.arrayBuffer());

    return {
        size: compressedSize,
        content: compressedContentAsUint8Array,
    };
};
