import {convertDecToHex} from './convert.ts';

export const buildUint8Array = (content: string): Uint8Array => {
    const uint8 = new Uint8Array(content.length);

    for (let i = 0; i < uint8.length; i++) {
        uint8[i] = content.charCodeAt(i);
    }
    return uint8;
};

export const buildFolderEnd = (tLen: number, cLen: number, lLen:number): string => {
    return 'PK\x05\x06' + // central folder end
        '\x00\x00' +
        '\x00\x00' +
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(tLen, 2) + // total number of entries in the central folder
        convertDecToHex(cLen, 4) + // size of the central folder
        convertDecToHex(lLen, 4) + // central folder start offset
        '\x00\x00';
};
