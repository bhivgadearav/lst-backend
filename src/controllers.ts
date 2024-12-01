import { DEVNET_URL, VAULT_PRIVATE_KEY, USER_PRIVATE_KEY, TOKEN_MINT_ADDRESS } from './keys';
import * as solana from '@solana/web3.js';
import * as solToken from '@solana/spl-token';
import bs58 from 'bs58';

// Function to calculate LSTs to send based on SOL amount
// Function to calculate LSTs to send based on SOL amount
const calculateLstsToSend = async (solana: number): Promise<number> => {
    const exchangeRate = await getExchangeRate('sol_to_lst'); // Fetch exchange rate for SOL to LST
    return solana * exchangeRate;
};

// Function to calculate native tokens to send based on LST amount
const calculateNativeTokensToSend = async (lsts: number): Promise<number> => {
    const exchangeRate = await getExchangeRate('lst_to_sol'); // Fetch exchange rate for LST to SOL
    return lsts * exchangeRate;
};

// Example database function to fetch the exchange rate
// This is a mockup; replace it with actual database logic
async function getExchangeRate(pair: 'sol_to_lst' | 'lst_to_sol'): Promise<number> {
    // Simulate fetching exchange rate from the database
    const date = new Date();
    const hour = date.getHours();

    // Dynamic exchange rates based on time of the day (for simulation)
    if (pair === 'sol_to_lst') {
        return 1 + hour * 0.01; // Increases exchange rate gradually during the day
    } else if (pair === 'lst_to_sol') {
        return 1 - hour * 0.01; // Decreases exchange rate gradually during the day
    }

    return 1; // Default fallback
}

// Ensure DEVNET_URL and VAULT_PRIVATE_KEY are set
if (!DEVNET_URL) {
    throw new Error('DEVNET_URL is not set');
}
if (!VAULT_PRIVATE_KEY) {
    throw new Error('VAULT_PRIVATE_KEY is not set');
}
if (!USER_PRIVATE_KEY) {
    throw new Error('USER_PRIVATE_KEY is not set');
}

// Establish connection to Solana devnet
const connection = new solana.Connection(DEVNET_URL, 'confirmed');
const vaultArray = bs58.decode(VAULT_PRIVATE_KEY);
const vault = solana.Keypair.fromSecretKey(vaultArray);
const userArray = bs58.decode(USER_PRIVATE_KEY);
const userWallet = solana.Keypair.fromSecretKey(userArray);

// Function to mint tokens to a sender's account
export const mintTokens = async (sender: string, amount: number) => {
    if (!TOKEN_MINT_ADDRESS) {
        throw new Error('TOKEN_MINT_ADDRESS is not set');
    }

    const lstsToSend = await calculateLstsToSend(amount);
    let tokenAccountAddress: solana.PublicKey;

    try {
        // Get associated token account address
        tokenAccountAddress = await solToken.getAssociatedTokenAddressSync(
            new solana.PublicKey(TOKEN_MINT_ADDRESS),
            new solana.PublicKey(sender),
            false,
            solToken.TOKEN_2022_PROGRAM_ID
        );

        // Check if the token account exists, create if it doesn't
        const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
        if (tokenAccountInfo === null || !tokenAccountInfo.owner) {
            console.log(`Token account ${tokenAccountAddress.toBase58()} does not exist. Creating it...`);
            await solToken.createAssociatedTokenAccount(
                connection,
                vault,
                new solana.PublicKey(TOKEN_MINT_ADDRESS),
                new solana.PublicKey(sender),
                {},
                solToken.TOKEN_2022_PROGRAM_ID,
                solToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                false
            );
        }

        console.log("Token account address: ", tokenAccountAddress.toBase58());

        // Mint tokens to the token account
        await solToken.mintTo(
            connection,
            vault,
            new solana.PublicKey(TOKEN_MINT_ADDRESS),
            tokenAccountAddress,
            vault.publicKey,
            lstsToSend,
            [],
            undefined,
            solToken.TOKEN_2022_PROGRAM_ID
        );

    } catch (error) {
        console.error('Error minting tokens:', error);
        if (error instanceof solana.SendTransactionError) {
            console.error('Transaction logs:', await error.getLogs(connection));
        }
        throw error;
    }
};

// Function to burn tokens and send native tokens to a user
export const burnAndSendNativeTokens = async (userAddress: string, amount: number) => {
    try {
        if (!TOKEN_MINT_ADDRESS) {
            throw new Error('TOKEN_MINT_ADDRESS is not set');
        }

        console.log("Burning tokens and sending native tokens");

        // const amountOfNativeTokensToSend = calculateNativeTokensToSend(amount);
        // console.log("Amount of native tokens to send", amountOfNativeTokensToSend);

        // Get associated token account address
        const tokenAccountAddress = await solToken.getAssociatedTokenAddressSync(
            new solana.PublicKey(TOKEN_MINT_ADDRESS),
            userWallet.publicKey,
            false,
            solToken.TOKEN_2022_PROGRAM_ID
        );

        // Create transaction to burn tokens and transfer native tokens
        const transaction = new solana.Transaction()
            .add(
                solToken.createBurnInstruction(
                    tokenAccountAddress,
                    new solana.PublicKey(TOKEN_MINT_ADDRESS),
                    userWallet.publicKey,
                    0.1 * solana.LAMPORTS_PER_SOL,
                    [],
                    solToken.TOKEN_2022_PROGRAM_ID
                )
            )
            .add(
                solana.SystemProgram.transfer({
                    fromPubkey: vault.publicKey,
                    toPubkey: userWallet.publicKey,
                    lamports: 0.1 * solana.LAMPORTS_PER_SOL,
                })
            );

        // Send and confirm transaction
        await solana.sendAndConfirmTransaction(connection, transaction, [vault, userWallet], {
            skipPreflight: true,
            commitment: "confirmed",
        });

        console.log("Tokens burned and native tokens sent");

    } catch (error) {
        if (error instanceof solana.SendTransactionError) {
            console.error('Transaction logs:', await error.getLogs(connection));
        }
        console.log("Error burning tokens and sending native tokens", error);
        throw new Error("Error burning tokens and sending native tokens");
    }
};
