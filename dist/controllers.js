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
exports.burnAndSendNativeTokens = exports.mintTokens = void 0;
const keys_1 = require("./keys");
const solana = __importStar(require("@solana/web3.js"));
const solToken = __importStar(require("@solana/spl-token"));
const bs58_1 = __importDefault(require("bs58"));
// Function to calculate LSTs to send based on SOL amount
// complete them and test burn tokens functions 
const calculateLstsToSend = (solana) => {
    return solana * 1000000000;
};
// Function to calculate native tokens to send based on LST amount
const calculateNativeTokensToSend = (lsts) => {
    return lsts * 1000000000;
};
// Ensure DEVNET_URL and VAULT_PRIVATE_KEY are set
if (!keys_1.DEVNET_URL) {
    throw new Error('DEVNET_URL is not set');
}
if (!keys_1.VAULT_PRIVATE_KEY) {
    throw new Error('VAULT_PRIVATE_KEY is not set');
}
if (!keys_1.USER_PRIVATE_KEY) {
    throw new Error('USER_PRIVATE_KEY is not set');
}
// Establish connection to Solana devnet
const connection = new solana.Connection(keys_1.DEVNET_URL, 'confirmed');
const vaultArray = bs58_1.default.decode(keys_1.VAULT_PRIVATE_KEY);
const vault = solana.Keypair.fromSecretKey(vaultArray);
const userArray = bs58_1.default.decode(keys_1.USER_PRIVATE_KEY);
const userWallet = solana.Keypair.fromSecretKey(userArray);
// Function to mint tokens to a sender's account
const mintTokens = (sender, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!keys_1.TOKEN_MINT_ADDRESS) {
        throw new Error('TOKEN_MINT_ADDRESS is not set');
    }
    const lstsToSend = calculateLstsToSend(amount);
    let tokenAccountAddress;
    try {
        // Get associated token account address
        tokenAccountAddress = yield solToken.getAssociatedTokenAddressSync(new solana.PublicKey(keys_1.TOKEN_MINT_ADDRESS), new solana.PublicKey(sender), false, solToken.TOKEN_2022_PROGRAM_ID);
        // Check if the token account exists, create if it doesn't
        const tokenAccountInfo = yield connection.getAccountInfo(tokenAccountAddress);
        if (tokenAccountInfo === null || !tokenAccountInfo.owner) {
            console.log(`Token account ${tokenAccountAddress.toBase58()} does not exist. Creating it...`);
            yield solToken.createAssociatedTokenAccount(connection, vault, new solana.PublicKey(keys_1.TOKEN_MINT_ADDRESS), new solana.PublicKey(sender), {}, solToken.TOKEN_2022_PROGRAM_ID, solToken.ASSOCIATED_TOKEN_PROGRAM_ID, false);
        }
        console.log("Token account address: ", tokenAccountAddress.toBase58());
        // Mint tokens to the token account
        yield solToken.mintTo(connection, vault, new solana.PublicKey(keys_1.TOKEN_MINT_ADDRESS), tokenAccountAddress, vault.publicKey, lstsToSend, [], undefined, solToken.TOKEN_2022_PROGRAM_ID);
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
// Function to burn tokens and send native tokens to a user
const burnAndSendNativeTokens = (userAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!keys_1.TOKEN_MINT_ADDRESS) {
            throw new Error('TOKEN_MINT_ADDRESS is not set');
        }
        console.log("Burning tokens and sending native tokens");
        // const amountOfNativeTokensToSend = calculateNativeTokensToSend(amount);
        // console.log("Amount of native tokens to send", amountOfNativeTokensToSend);
        // Get associated token account address
        const tokenAccountAddress = yield solToken.getAssociatedTokenAddressSync(new solana.PublicKey(keys_1.TOKEN_MINT_ADDRESS), userWallet.publicKey, false, solToken.TOKEN_2022_PROGRAM_ID);
        // Create transaction to burn tokens and transfer native tokens
        const transaction = new solana.Transaction()
            .add(solToken.createBurnInstruction(tokenAccountAddress, new solana.PublicKey(keys_1.TOKEN_MINT_ADDRESS), userWallet.publicKey, 0.1 * solana.LAMPORTS_PER_SOL, [], solToken.TOKEN_2022_PROGRAM_ID))
            .add(solana.SystemProgram.transfer({
            fromPubkey: vault.publicKey,
            toPubkey: userWallet.publicKey,
            lamports: 0.1 * solana.LAMPORTS_PER_SOL,
        }));
        // Send and confirm transaction
        yield solana.sendAndConfirmTransaction(connection, transaction, [vault, userWallet], {
            skipPreflight: true,
            commitment: "confirmed",
        });
        console.log("Tokens burned and native tokens sent");
    }
    catch (error) {
        if (error instanceof solana.SendTransactionError) {
            console.error('Transaction logs:', yield error.getLogs(connection));
        }
        console.log("Error burning tokens and sending native tokens", error);
        throw new Error("Error burning tokens and sending native tokens");
    }
});
exports.burnAndSendNativeTokens = burnAndSendNativeTokens;
