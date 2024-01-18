import {excelFileFactory} from './excelFileFactory.ts';
import {ZipContainer} from '../zip/zipContainer.ts';

export const getMultipleSheetsAsExcel = async (compressOutput: boolean = false): Promise<Blob | undefined> => {
    ZipContainer.addFolders([
        '_rels/',
        'docProps/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'xl/worksheets/'
    ]);

    ZipContainer.addFile('_rels/.rels', excelFileFactory.createDotRels());
    ZipContainer.addFile('docProps/core.xml', excelFileFactory.createCore());
    ZipContainer.addFile('[Content_Types].xml', excelFileFactory.createContentTypes());

    ZipContainer.addFile('xl/workbook.xml', excelFileFactory.xl__createWorkbook());
    ZipContainer.addFile('xl/sharedStrings.xml', excelFileFactory.xl__createSharedStrings());
    ZipContainer.addFile('xl/styles.xml', excelFileFactory.xl__createStylesheet());
    ZipContainer.addFile('xl/_rels/workbook.xml.rels', excelFileFactory.xl__createRelsWorkbook());
    ZipContainer.addFile('xl/theme/theme1.xml', excelFileFactory.xl__createTheme());
    ZipContainer.addFile('xl/worksheets/sheet1.xml', excelFileFactory.xl__createWorksheet());

    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return ZipContainer.getContent(mimeType, compressOutput);
};
