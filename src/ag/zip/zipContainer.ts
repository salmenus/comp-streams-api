import {convertDate, convertTime, decToHex} from './convert.ts';
import {crcTable} from './ctcTable.ts';
import {utf8Encode} from './utf8Encode.ts';

export interface ZipFolder {
    path: string;
    created: Date;
    isBase64: boolean;
}

export interface ZipFile extends ZipFolder {
    content?: string;
}

export class ZipContainer {
    private static folders: ZipFolder[] = [];
    private static files: ZipFile[] = [];

    public static addFolders(paths: string[]): void {
        paths.forEach(this.addFolder.bind(this));
    }

    private static addFolder(path: string): void {
        this.folders.push({
            path,
            created: new Date(),
            isBase64: false
        });
    }

    public static addFile(path: string, content: string, isBase64 = false): void {
        this.files.push({
            path,
            created: new Date(),
            content,
            isBase64
        });
    }

    public static async getContent(mimeType: string = 'application/zip', compressOutput: boolean): Promise<Blob> {
        const textOutput = await this.buildFileStream(compressOutput);
        const uInt8Output = this.buildUint8Array(textOutput);
        this.clearStream();

        return new Blob([uInt8Output], { type: mimeType });
    }

    private static clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private static async buildFileStream(compressOutput: boolean): Promise<string> {
        const totalFiles = this.folders.concat(this.files);
        const len = totalFiles.length;
        let fData = '';
        let foData = '';
        let lL = 0;
        let cL = 0;

        for (const currentFile of totalFiles) {
            const { fileHeader, folderHeader, content, isCompressed } = await this.getHeaderAndContent(currentFile, lL, compressOutput);
            if (isCompressed) {
                console.log('compressed!');
            }
            lL += fileHeader.length + content.length;
            cL += folderHeader.length;
            fData += fileHeader + content;
            foData += folderHeader;
        }

        const foEnd = this.buildFolderEnd(len, cL, lL);

        return fData + foData + foEnd;
    }

    private static async compressLocalFileContent(content: string, isBase64: boolean): Promise<{
        size: number;
        content: Uint8Array;
    }> {
        console.log('Attempting to compress local file content...');
        console.log(content);
        console.log(isBase64);

        return { content: new Uint8Array(), size: 0 };

        // let contentToCompress = content;
        // if (isBase64) {
        //     const c = content.split(';base64,')[1];
        //     contentToCompress = atob(c);
        // }
        //
        // const {
        //     size: compressedSize,
        //     content: compressedContentString
        // } = await compressBlob(content);
        //
        // console.log('---');
        // console.log('Compressed String Content Length: ' + compressedSize);
        // console.log('Compression Ratio: ' + (compressedSize / contentToCompress.length) * 100);
        // console.log('---');
        //
        // return {
        //     size: compressedSize,
        //     content: compressedContentString,
        // };
    }

    private static async getHeaderAndContent(currentFile: ZipFile, offset: number, compressOutput: boolean): Promise<{
        fileHeader: string;
        folderHeader: string;
        content: string | Uint8Array;
        isCompressed: boolean;
    }> {
        const { content, path, created, isBase64 } = currentFile;

        const utfPath = utf8Encode(path);
        const isUTF8 = utfPath !== path;
        const time = convertTime(created);
        const dt = convertDate(created);

        let extraFields = '';

        if (isUTF8) {
            const uExtraFieldPath = decToHex(1, 1) + decToHex(this.getFromCrc32Table(utfPath), 4) + utfPath;
            extraFields = "\x75\x70" +  decToHex(uExtraFieldPath.length, 2) + uExtraFieldPath;
        }

        const { size, content: convertedContent } = !content ? { size: 0, content: ''} : this.getConvertedContent(content, isBase64);

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
            const result = await this.compressLocalFileContent(convertedContent, isBase64);
            compressedContent = result.content;
            compressedSize = result.size;
            log && console.log('compressed size: ' + compressedSize);
            compressionPerformed = true;
        }

        const contentToUse = compressedContent !== undefined ? compressedContent : convertedContent;
        const crcFlag = compressedContent !== undefined ? this.getFromCrc32TableAndByteArray(compressedContent) : this.getFromCrc32Table(convertedContent);
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
    }

    private static getConvertedContent(content: string, isBase64 = false): { size: number; content: string } {
        if (isBase64) {
            content = content.split(';base64,')[1];
        }
        content = isBase64 ? atob(content) : content;

        return {
            size: content.length,
            content
        };
    }

    private static buildFolderEnd(tLen: number, cLen: number, lLen:number): string {
        return 'PK\x05\x06' + // central folder end
            '\x00\x00' +
            '\x00\x00' +
            decToHex(tLen, 2) + // total number of entries in the central folder
            decToHex(tLen, 2) + // total number of entries in the central folder
            decToHex(cLen, 4) + // size of the central folder
            decToHex(lLen, 4) + // central folder start offset
            '\x00\x00';
    }

    private static buildUint8Array(content: string): Uint8Array {
        const uint8 = new Uint8Array(content.length);

        for (let i = 0; i < uint8.length; i++) {
            uint8[i] = content.charCodeAt(i);
        }
        return uint8;
    }

    private static getFromCrc32TableAndByteArray(content: Uint8Array): number {
        if (!content.length) { return 0; }

        let crc = 0 ^ (-1);

        let j = 0;
        let k = 0;
        let l = 0;

        for (let i = 0; i < content.length; i++) {
            j = content[i];
            k = (crc ^ j) & 0xFF;
            l = crcTable[k];
            crc = (crc >>> 8) ^ l;
        }

        return crc ^ (-1);
    }

    private static getFromCrc32Table(content: string): number {
        if (!content.length) { return 0; }

        const size = content.length;
        const iterable = new Uint8Array(size);

        for (let i = 0; i < size; i++) {
            iterable[i] = content.charCodeAt(i);
        }

        return this.getFromCrc32TableAndByteArray(iterable);
    }
}
