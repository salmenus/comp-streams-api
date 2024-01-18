import {buildFolderEnd} from './buildZip.ts';
import {convertStringToByteArray} from './convert.ts';
import {getHeaderAndContent} from './getHeaderAndContent.ts';

export interface ZipFile {
    path: string;
    created: Date;
    isBase64: boolean;
    type: 'file' | 'folder';
    content: string | undefined;
    canBeCompressed: boolean;
}

export interface ZipFolder extends ZipFile {
    type: 'folder';
    content: undefined;
    canBeCompressed: false;
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
            isBase64: false,
            type: 'folder',
            content: undefined,
            canBeCompressed: false
        });
    }

    public static addFile(path: string, content: string, canBeCompressed: boolean = false, isBase64 = false): void {
        this.files.push({
            path,
            created: new Date(),
            content,
            isBase64,
            canBeCompressed,
            type: 'file'
        });
    }

    public static async getContent(mimeType: string = 'application/zip', compressOutput: boolean): Promise<Blob> {
        const textOutput = await this.buildFileStream(compressOutput);
        // const uInt8Output = convertStringToByteArray(textOutput);
        this.clearStream();

        return new Blob([textOutput], { type: mimeType });
    }

    private static clearStream(): void {
        this.folders = [];
        this.files = [];
    }

    private static async buildFileStream(compressOutput: boolean): Promise<Uint8Array> {
        const totalFiles: ZipFile[] = [...this.folders, ...this.files];
        const len = totalFiles.length;
        let fData: Uint8Array = new Uint8Array(0);
        let foData: Uint8Array = new Uint8Array(0);
        let lL = 0;
        let cL = 0;

        for (const currentFile of totalFiles) {
            const {
                fileHeader,
                folderHeader,
                content,
            } = await getHeaderAndContent(currentFile, lL, compressOutput);

            lL += fileHeader.length + content.length;
            cL += folderHeader.length;

            // Append fileHeader to fData
            fData = new Uint8Array([...fData, ...convertStringToByteArray(fileHeader)]);

            // Append content to fData
            const contentAsUint8Array = typeof content === 'string' ? convertStringToByteArray(content) : content;
            fData = new Uint8Array([...fData, ...contentAsUint8Array]);

            // Append folder header to foData
            foData = new Uint8Array([...foData, ...convertStringToByteArray(folderHeader)]);

            // fData += fileHeader + content;
            // foData += folderHeader;
        }

        const foEnd = buildFolderEnd(len, cL, lL);

        // Append folder end to foData
        return new Uint8Array([...fData, ...foData, ...convertStringToByteArray(foEnd)]);

        // return fData + foData + foEnd;
    }
}
