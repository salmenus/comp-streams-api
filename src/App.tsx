import {useCallback, useEffect, useState} from 'react';
import './App.css';
import {xlsxBuild} from './ag/xlsxBuild.ts';
import {compressBlob} from './utils/compress.ts';
import {formatFileSize} from './utils/formatFileSize.ts';
import {readFileAsBlob} from './utils/readFile.ts';
import rawData from './data/data.json';

type Status = 'idle' | 'compressing' | 'error' | 'success';

function App() {
    const [status, setStatus] = useState<Status>('idle');
    const [fileData, setFileData] = useState<Blob | undefined>(undefined);
    const [compressedFileData, setCompressedFileData] = useState<Blob | undefined>(undefined);
    const [filePath, setFilePath] = useState('/big-file.xlsx');

    const reset = useCallback(() => {
        setStatus('idle');
        setFileData(undefined);
        setCompressedFileData(undefined);
    }, []);

    const download = useCallback(() => {
        if (!compressedFileData) {
            console.error('Compressed file data is not loaded');
            return;
        }

        const url = URL.createObjectURL(compressedFileData);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed-file.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    }, [compressedFileData]);

    const compressFile = useCallback(() => {
        setStatus('compressing');
        console.log('Compressing file...');

        if (!fileData) {
            console.error('File data is not loaded');
            setStatus('error');
            return;
        }

        compressBlob(fileData)
            .then((compressedBlob) => {
                console.log('File compressed - File size:');
                console.log(compressedBlob.size);
                setStatus('success');
                setCompressedFileData(compressedBlob);
            })
            .catch((err) => {
                console.error(err);
                setStatus('error');
                setCompressedFileData(undefined);
            });
    }, [fileData]);

    const buildCompressedExcelFile = useCallback(() => {
        setStatus('compressing');
        console.log('Compressing file from memory ! ...');

        xlsxBuild(rawData).then((blob) => {
            console.log('File compressed - File size:');
            console.log(blob.size);
            setStatus('success');
            setCompressedFileData(blob);
        }).catch((err) => {
            console.error(err);
            setStatus('error');
            setCompressedFileData(undefined);
        });
    }, []);

    useEffect(() => {
        readFileAsBlob(filePath)
            .then((blob) => {
                console.log('File loaded in memory - File size:');
                console.log(blob.size);
                setFileData(blob);
            })
            .catch((err) => {
                console.error(err);
                setFileData(undefined);
            });
    }, [filePath]);

    return (
        <>
            <h3>File Compression Util</h3>
            <button onClick={reset}>Reset</button>
            <div className="card">
                <span>
                    File Path: <input type="text" value={filePath} onChange={(e) => setFilePath(e.target.value)} />
                </span>
                {fileData && (
                    <p>
                        File size is before compression: {formatFileSize(fileData.size)}
                    </p>
                )}
                {status === 'idle' && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button onClick={compressFile}>Compress File In Path</button>
                        <hr />
                        <button onClick={buildCompressedExcelFile}>Build And Compress File From JSON Data</button>
                    </div>
                )}
                {status === 'success' && compressedFileData !== undefined && (
                    <>
                        <p>
                        File size is after compression: {formatFileSize(compressedFileData.size)}
                        </p>
                        <button onClick={download}>Download Compressed File</button>
                    </>
                )}
            </div>
        </>
    );
}

export default App;
