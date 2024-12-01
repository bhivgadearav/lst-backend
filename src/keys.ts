import dotenv from "dotenv";
dotenv.config();

export const VAULT_PRIVATE_KEY = process.env.VAULT_PRIVATE_KEY;
export const VAULT_PUBLIC_KEY = process.env.VAULT_PUBLIC_KEY;
export const USER_PRIVATE_KEY =  process.env.USER_PRIVATE_KEY;
export const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
export const MAINNET_URL = process.env.MAINNET_URL;
export const DEVNET_URL = process.env.DEVNET_URL;
