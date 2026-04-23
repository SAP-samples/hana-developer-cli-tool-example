export function textResponse(text) {
    return { content: [{ type: 'text', text }] };
}
export function jsonResponse(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
export function errorResponse(message) {
    return { content: [{ type: 'text', text: message }], isError: true };
}
//# sourceMappingURL=types.js.map