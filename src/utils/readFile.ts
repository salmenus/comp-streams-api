export const readFileAsBlob = (filepath: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();
        xhr.open("GET", filepath);
        xhr.responseType = "blob";

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`File read error: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error(`File read error: ${xhr.statusText}`));
        };

        xhr.send();

    });
};
