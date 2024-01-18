export const getConvertedContent = (content: string, isBase64 = false): { size: number; content: string } => {
    if (isBase64) {
        content = content.split(';base64,')[1];
    }

    content = isBase64 ? atob(content) : content;
    return {
        size: content.length,
        content
    };
};
