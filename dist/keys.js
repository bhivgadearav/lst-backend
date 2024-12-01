"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVNET_URL = exports.MAINNET_URL = exports.TOKEN_MINT_ADDRESS = exports.USER_PRIVATE_KEY = exports.VAULT_PUBLIC_KEY = exports.VAULT_PRIVATE_KEY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.VAULT_PRIVATE_KEY = process.env.VAULT_PRIVATE_KEY;
exports.VAULT_PUBLIC_KEY = process.env.VAULT_PUBLIC_KEY;
exports.USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
exports.TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
exports.MAINNET_URL = process.env.MAINNET_URL;
exports.DEVNET_URL = process.env.DEVNET_URL;
