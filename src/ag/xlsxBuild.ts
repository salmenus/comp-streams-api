import {getMultipleSheetsAsExcel} from './excel.ts';

export const xlsxBuild = async (inputData: Array<object>): Promise<Blob> => {
    console.log('xlsxBuild');
    console.log('Raw input data with length ' + inputData.length + ' will be ignored, and static data will be returned instead!');

    const result = await getMultipleSheetsAsExcel();
    if (!result) {
        throw new Error('getMultipleSheetsAsExcel() returned undefined!');
    }

    return result;
};
