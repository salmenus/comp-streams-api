import {compressBlob} from '../../utils/compress.ts';
import {getDecodedContent} from './getDecodedContent.ts';

export const compressLocalFile = async (content: string, isBase64: boolean): Promise<{
    size: number;
    content: Uint8Array;
}> => {
    const {
        content: decodedContent,
        size: decodedContentSize,
    } = getDecodedContent(content, isBase64);

    const contentAsBlob = new Blob([decodedContent]);

    const {
        size: compressedSize,
        content: compressedContent
    } = await compressBlob(contentAsBlob);

    console.log('---');
    console.log('Compressed String Content Length: ' + compressedSize);
    console.log('Compression Ratio: ' + (compressedSize / decodedContentSize) * 100);
    console.log('---');

    const compressedContentAsUint8Array = new Uint8Array(await compressedContent.arrayBuffer());

    return {
        size: compressedSize,
        content: compressedContentAsUint8Array,
    };
};
