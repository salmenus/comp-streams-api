import {normalFile} from '../static/normalFile.ts';
import {ExcelAlignment, ExcelProtection} from '../types.ts';

const fileToUser = normalFile;

export const excelFileFactory = (() => {
    const xl__createStylesheet = () => fileToUser.xl__styles;
    const xl__createSharedStrings = () => fileToUser.xl__sharedStrings;
    const xl__createRelsWorkbook = () => fileToUser.xl__dotRels__workbook;
    const xl__createWorkbook = () => fileToUser.xl__workbook;
    const xl__createTheme = () => fileToUser.xl__theme__theme1;
    const xl__createWorksheet = () => fileToUser.xl__worksheets__sheet1;

    const createCore = () => fileToUser.docProps__core;
    const createContentTypes = () => fileToUser.contentTypes;
    const createDotRels = () => fileToUser.dotRels;

    return {
        xl__createWorkbook,
        xl__createSharedStrings,
        xl__createRelsWorkbook,
        xl__createStylesheet,
        xl__createTheme,
        xl__createWorksheet,

        createDotRels,
        createCore,
        createContentTypes,
    };
})();

export interface Xf {
    alignment?: ExcelAlignment;
    borderId: number;
    fillId: number;
    fontId: number;
    numFmtId: number;
    xfId?: number;
    protection?: ExcelProtection;
}
