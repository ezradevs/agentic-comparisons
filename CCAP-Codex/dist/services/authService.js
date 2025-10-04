"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const userService_1 = require("./userService");
const toAuthenticatedUser = (user) => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
});
exports.authService = {
    async login(email, password) {
        const user = userService_1.userService.getByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValid = await userService_1.userService.verifyPassword(user, password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        const token = this.issueToken(user);
        return { token, user: toAuthenticatedUser(user) };
    },
    issueToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        const options = {
            expiresIn: config_1.config.tokenExpiresIn
        };
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, options);
    },
    verifyToken(token) {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = userService_1.userService.getById(decoded.sub);
        if (!user) {
            throw new Error('User not found');
        }
        return toAuthenticatedUser(user);
    }
};
