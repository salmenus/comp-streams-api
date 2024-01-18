import {getMultipleSheetsAsExcel} from './getMultipleSheetsAsExcel.ts';

export const createExcelDocument = async (inputData: Array<object>, compressOutput: boolean): Promise<Blob> => {
    console.log('xlsxBuild');
    console.log('Raw input data with length ' + inputData.length + ' will be ignored, and static data will be returned instead!');

    const result = await getMultipleSheetsAsExcel(compressOutput);
    if (!result) {
        throw new Error('getMultipleSheetsAsExcel() returned undefined!');
    }

    return result;
};
