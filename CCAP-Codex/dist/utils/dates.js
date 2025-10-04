"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIso = exports.nowIso = void 0;
const nowIso = () => new Date().toISOString();
exports.nowIso = nowIso;
const toIso = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toISOString();
};
exports.toIso = toIso;
