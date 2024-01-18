import {decToHex} from './convert.ts';

export const buildUint8Array = (content: string): Uint8Array => {
    const uint8 = new Uint8Array(content.length);

    for (let i = 0; i < uint8.length; i++) {
        uint8[i] = content.charCodeAt(i);
    }
    return uint8;
};

export const getConvertedContent = (content: string, isBase64 = false): { size: number; content: string } => {
    if (isBase64) {
        content = content.split(';base64,')[1];
    }
    content = isBase64 ? atob(content) : content;

    return {
        size: content.length,
        content
    };
};

export const buildFolderEnd = (tLen: number, cLen: number, lLen:number): string => {
    return 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        decToHex(tLen, 2) + // total number of entries in the central folder
        decToHex(tLen, 2) + // total number of entries in the central folder
        decToHex(cLen, 4) + // size of the central folder
        decToHex(lLen, 4) + // central folder start offset
        '\x00\x00';
};
