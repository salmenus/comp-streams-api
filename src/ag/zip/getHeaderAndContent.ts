import {getConvertedContent} from './buildZip.ts';
import {compressLocalFileContent} from './compressLocalFile.ts';
import {convertDate, convertTime, decToHex} from './convert.ts';
import {getFromCrc32Table, getFromCrc32TableAndByteArray} from './ctcTable.ts';
import {utf8Encode} from './utf8Encode.ts';
import {ZipFile} from './zipContainer.ts';

export const getHeaderAndContent = async (currentFile: ZipFile, offset: number, compressOutput: boolean): Promise<{
    fileHeader: string;
    folderHeader: string;
    content: string | Uint8Array;
    isCompressed: boolean;
}> => {
    const { content, path, created, isBase64 } = currentFile;

    const utfPath = utf8Encode(path);
    const isUTF8 = utfPath !== path;
    const time = convertTime(created);
    const dt = convertDate(created);

    let extraFields = '';

    if (isUTF8) {
        const uExtraFieldPath = decToHex(1, 1) + decToHex(getFromCrc32Table(utfPath), 4) + utfPath;
        extraFields = "\x75\x70" +  decToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
    }

    const { size, content: convertedContent } = !content ? { size: 0, content: ''} : getConvertedContent(content, isBase64);

    let compressedContent: Uint8Array | undefined = undefined;
    let compressedSize: number | undefined = undefined;

    let log = false;
    const isExcelSheet = currentFile.path.endsWith('.xml') && currentFile.path.includes('xl/worksheets');
    if (isExcelSheet) {
        console.log('-------------------');
        console.log('sheet file!');
        log = true;
    }

    log && console.log('path: ' + currentFile.path);
    log && console.log('content size: ' + size);

    let compressionPerformed = false;
    if (compressOutput)  {
        log && console.log('compressing...');
        const result = await compressLocalFileContent(convertedContent, isBase64);
        compressedContent = result.content;
        compressedSize = result.size;
        log && console.log('compressed size: ' + compressedSize);
        compressionPerformed = true;
    }

    const contentToUse = compressedContent !== undefined ? compressedContent : convertedContent;
    const crcFlag = compressedContent !== undefined ? getFromCrc32TableAndByteArray(compressedContent) : getFromCrc32Table(convertedContent);
    const sizeToUse = compressedSize !== undefined ? compressedSize : size;
    const compressionMethod = compressionPerformed ? 8 : 0; // As per ECMA-376 Part 2 specs

    const header = '\x0A\x00' +
        (isUTF8 ? '\x00\x08' : '\x00\x00') +
        decToHex(compressionMethod, 2) + // The file is Deflated
        decToHex(time, 2) + // last modified time
        decToHex(dt, 2) + // last modified date
        decToHex(sizeToUse ? crcFlag : 0, 4) +
        decToHex(compressedSize ?? size, 4) + // compressed size
        decToHex(size, 4) + // uncompressed size
        decToHex(utfPath.length, 2) + // file name length
        decToHex(extraFields.length, 2); // extra field length

    const fileHeader = 'PK\x03\x04' + header + utfPath + extraFields;
    const folderHeader =
        'PK\x01\x02' + // central header
        '\x14\x00' +
        header + // file header
        '\x00\x00' +
        '\x00\x00' +
        '\x00\x00' +
        (content ? '\x00\x00\x00\x00' : '\x10\x00\x00\x00') + // external file attributes
        decToHex(offset, 4) + // relative offset of local header
        utfPath + // file name
        extraFields; // extra field

    return {
        fileHeader,
        folderHeader,
        content: contentToUse || '',
        isCompressed: compressionPerformed,
    };
};
