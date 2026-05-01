export function textResponse(text: any): {
    content: {
        type: string;
        text: any;
    }[];
};
export function jsonResponse(data: any): {
    content: {
        type: string;
        text: string;
    }[];
};
export function errorResponse(message: any): {
    content: {
        type: string;
        text: any;
    }[];
    isError: boolean;
};
