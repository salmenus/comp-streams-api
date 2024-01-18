export const getDecodedContent = (content: string, isBase64 = false): { size: number; content: string } => {

    // isBase64 is true when the content is a base64 string
    // such with base64 encoded images!

    content = isBase64
        ? atob(content.split(';base64,')[1])
        : content;

    return {
        size: content.length,
        content
    };
};
