import { DEVNET_URL, VAULT_PRIVATE_KEY, USER_PRIVATE_KEY, TOKEN_MINT_ADDRESS } from './keys';
import * as solana from '@solana/web3.js';
import * as solToken from '@solana/spl-token';
import bs58 from 'bs58';
import prisma from './prisma';

const calculateLstsToSend = async (solana: number, senderKey: string): Promise<number> => {
    const exchangeRate = await getExchangeRate('sol_to_lst', senderKey);
    return solana * exchangeRate;
};

const calculateNativeTokensToSend = async (lsts: number, senderKey: string): Promise<number> => {
    const exchangeRate = await getExchangeRate('lst_to_sol', senderKey);
    return lsts * exchangeRate;
};

const getExchangeRate = async (pair: 'sol_to_lst' | 'lst_to_sol', senderKey: string): Promise<number> => {
    const hours = new Date().getHours();
    const user = await prisma.user.findUnique({
        where: {
            publicKey: senderKey,
        },
    });
    const eventDate = new Date(user.createdAt);
    const timePassed = hours - eventDate.getHours();
    if (user) {
        if (pair === 'sol_to_lst') {
            return 1 + timePassed * 0.01;
        } else if (pair === 'lst_to_sol') {
            return 1 - timePassed * 0.01;
        }
    }

    return 1;
};

if (!DEVNET_URL) {
    throw new Error('DEVNET_URL is not set');
}

if (!VAULT_PRIVATE_KEY) {
    throw new Error('VAULT_PRIVATE_KEY is not set');
}

if (!USER_PRIVATE_KEY) {
    throw new Error('USER_PRIVATE_KEY is not set');
}

const connection = new solana.Connection(DEVNET_URL, 'confirmed');
const vaultArray = bs58.decode(VAULT_PRIVATE_KEY);
const vault = solana.Keypair.fromSecretKey(vaultArray);
const userArray = bs58.decode(USER_PRIVATE_KEY);
const userWallet = solana.Keypair.fromSecretKey(userArray);

export const mintTokens = async (sender: string, amount: number) => {
    if (!TOKEN_MINT_ADDRESS) {
        throw new Error('TOKEN_MINT_ADDRESS is not set');
    }

    const lstsToSend = await calculateLstsToSend(amount, sender);
    let tokenAccountAddress: solana.PublicKey;

    try {
        tokenAccountAddress = await solToken.getAssociatedTokenAddressSync(
            new solana.PublicKey(TOKEN_MINT_ADDRESS),
            new solana.PublicKey(sender),
            false,
            solToken.TOKEN_2022_PROGRAM_ID
        );
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

        await prisma.transaction.create({
            data: {
                publicKey: sender,
                amount: lstsToSend,
                requestType: 'MINT',
            },
        });

    } catch (error) {
        console.error('Error minting tokens:', error);
        if (error instanceof solana.SendTransactionError) {
            console.error('Transaction logs:', await error.getLogs(connection));
        }
        throw error;
    }
};

export const burnAndSendNativeTokens = async (userAddress: string, amount: number) => {
    try {
        if (!TOKEN_MINT_ADDRESS) {
            throw new Error('TOKEN_MINT_ADDRESS is not set');
        }
        console.log("Burning tokens and sending native tokens");

        const nativeTokensToSend = await calculateNativeTokensToSend(amount, userAddress);

        const tokenAccountAddress = await solToken.getAssociatedTokenAddressSync(
            new solana.PublicKey(TOKEN_MINT_ADDRESS),
            userWallet.publicKey,
            false,
            solToken.TOKEN_2022_PROGRAM_ID
        );

        const transaction = new solana.Transaction()
            .add(
                solToken.createBurnInstruction(
                    tokenAccountAddress,
                    new solana.PublicKey(TOKEN_MINT_ADDRESS),
                    userWallet.publicKey,
                    amount,
                    [],
                    solToken.TOKEN_2022_PROGRAM_ID
                )
            )
            .add(
                solana.SystemProgram.transfer({
                    fromPubkey: vault.publicKey,
                    toPubkey: userWallet.publicKey,
                    lamports: nativeTokensToSend * solana.LAMPORTS_PER_SOL,
                })
            );

        await solana.sendAndConfirmTransaction(connection, transaction, [vault, userWallet], {
            skipPreflight: true,
            commitment: "confirmed",
        });

        await prisma.transaction.create({
            data: {
                publicKey: userAddress,
                amount: amount,
                requestType: 'BURN',
            },
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
