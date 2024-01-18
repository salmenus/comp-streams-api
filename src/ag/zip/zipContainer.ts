import {buildFolderEnd, buildUint8Array} from './buildZip.ts';
import {getHeaderAndContent} from './getHeaderAndContent.ts';

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
        const uInt8Output = buildUint8Array(textOutput);
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
            const {
                fileHeader,
                folderHeader,
                content,
            } = await getHeaderAndContent(currentFile, lL, compressOutput);

            lL += fileHeader.length + content.length;
            cL += folderHeader.length;
            fData += fileHeader + content;
            foData += folderHeader;
        }

        const foEnd = buildFolderEnd(len, cL, lL);
        return fData + foData + foEnd;
    }
}
