import {contentTypes} from '../static/smallFile/contentTypes.ts';
import {docProps__core} from '../static/smallFile/docProps__core.ts';
import {dotRels} from '../static/smallFile/dotRels.ts';
import {xl__sharedStrings} from '../static/smallFile/xl__sharedStrings.ts';
import {xl__styles} from '../static/smallFile/xl__styles.ts';
import {xl__theme__theme1} from '../static/smallFile/xl__theme__theme1.ts';
import {xl__dotRels__workbook} from '../static/smallFile/xl__dotRels__workbook.ts';
import {xl__workbook} from '../static/smallFile/xl__workbook.ts';
import {xl__worksheets__sheet1} from '../static/smallFile/xl__worksheets__sheet1.ts';
import {ExcelAlignment, ExcelProtection} from '../types.ts';

export const excelFileFactory = (() => {
    const xl__createStylesheet = () => xl__styles;
    const xl__createSharedStrings = () => xl__sharedStrings;
    const xl__createRelsWorkbook = () => xl__dotRels__workbook;
    const xl__createWorkbook = () => xl__workbook;
    const xl__createTheme = () => xl__theme__theme1;
    const xl__createWorksheet = () => xl__worksheets__sheet1;

    const createCore = () => docProps__core;
    const createContentTypes = () => contentTypes;
    const createDotRels = () => dotRels;

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
