"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = void 0;
const address_1 = require("./address");
const solana = __importStar(require("@solana/web3.js"));
const solToken = __importStar(require("@solana/spl-token"));
const bs58_1 = __importDefault(require("bs58"));
const mintTokens = (sender, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!address_1.DEVNET_URL) {
        throw new Error('DEVNET_URL is not set');
    }
    if (!address_1.VAULT_PRIVATE_KEY) {
        throw new Error('VAULT_PRIVATE_KEY is not set');
    }
    if (!address_1.TOKEN_MINT_ADDRESS) {
        throw new Error('TOKEN_MINT_ADDRESS is not set');
    }
    const connection = new solana.Connection(address_1.DEVNET_URL, 'confirmed');
    const vaultArray = bs58_1.default.decode(address_1.VAULT_PRIVATE_KEY);
    const vault = solana.Keypair.fromSecretKey(vaultArray);
    let tokenAccountAddress;
    try {
        tokenAccountAddress = yield solToken.getAssociatedTokenAddressSync(new solana.PublicKey(address_1.TOKEN_MINT_ADDRESS), new solana.PublicKey(sender), false, solToken.TOKEN_2022_PROGRAM_ID);
        // Check if the token account exists
        const tokenAccountInfo = yield connection.getAccountInfo(tokenAccountAddress);
        if (tokenAccountInfo === null || !tokenAccountInfo.owner) {
            console.log(`Token account ${tokenAccountAddress.toBase58()} does not exist. Creating it...`);
            yield solToken.createAssociatedTokenAccount(connection, vault, new solana.PublicKey(address_1.TOKEN_MINT_ADDRESS), new solana.PublicKey(sender), {}, solToken.TOKEN_2022_PROGRAM_ID, solToken.ASSOCIATED_TOKEN_PROGRAM_ID, false);
        }
        console.log("Token account address: ", tokenAccountAddress.toBase58());
        yield solToken.mintTo(connection, vault, new solana.PublicKey(address_1.TOKEN_MINT_ADDRESS), tokenAccountAddress, vault.publicKey, amount, [], undefined, solToken.TOKEN_2022_PROGRAM_ID);
        // try using creating and sending transactions approach
        // const transaction = new solana.Transaction().add(
        //     solToken.createMintToInstruction(
        //         new solana.PublicKey("F9UnQx7Xs4wXMDEqssXyUMoLMFomG2giZjEWHeUR1K9X"),
        //         new solana.PublicKey("2TQhLBAqffeuEjErrcM9pvTh6xCs17xN1qLNsGhmE4hg"),
        //         new solana.PublicKey("BgnZyQVsi5L6YdGKAADA7pRqEStaL9CLP26VFcRP83Md"),
        //         amount
        //     )
        // )
        // const signature = await solana.sendAndConfirmTransaction(
        //     connection,
        //     transaction,
        //     [vault]
        // );
        // console.log('Transaction signature:', signature);
    }
    catch (error) {
        console.error('Error minting tokens:', error);
        if (error instanceof solana.SendTransactionError) {
            console.error('Transaction logs:', yield error.getLogs(connection));
        }
        throw error;
    }
});
exports.mintTokens = mintTokens;
const burnTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Burning tokens");
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Sending native tokens");
});
exports.sendNativeTokens = sendNativeTokens;
