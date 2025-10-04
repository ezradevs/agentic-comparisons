"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const parse = (schema, data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        const message = result.error.issues.map((issue) => issue.message).join(', ');
        const error = new Error(message);
        throw error;
    }
    return result.data;
};
exports.parse = parse;
