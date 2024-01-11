export const formatFileSize = (bytes: number) => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    let l = 0;
    let n = bytes;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
};
