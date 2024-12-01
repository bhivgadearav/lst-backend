import express from 'express';
import { burnAndSendNativeTokens, mintTokens } from './controllers';
import { VAULT_PUBLIC_KEY } from './keys';
import dotenv from "dotenv";
dotenv.config();

const app = express();


export const HELIUS_RESPONSE = { "amount":100000000,
    "fromUserAccount":"CT4gHkBHaJKUgKnqeQJYSV4TJi4uL4vrjLaYg6VoaFKj",
    "toUserAccount":"6Y5qPUMEZ1fjs25R563vbSwG1vv8aKgn3LjTGUfLgs5h" }

export const HELIUS_TOKEN_RESPONSE = { "fromTokenAccount":"BgnZyQVsi5L6YdGKAADA7pRqEStaL9CLP26VFcRP83Md",
                   "fromUserAccount":"6Y5qPUMEZ1fjs25R563vbSwG1vv8aKgn3LjTGUfLgs5h",
                   "mint":"5NJUkbB4dye8u2RFtXi617YqkAngmhvbPizadWW6N4YD",
                   "toTokenAccount":"VDjd41UaWu6jTtHXwWRxRaVvevz4f7jvUfaXHexb8s5",
                   "toUserAccount":"9DHsPEfBA7qPv9n2X942Hh1mud4ePSnbw4pvHNh98Eth",
                   "tokenAmount":1,
                   "tokenStandard":"Fungible" }

app.post('/csol', async(req, res) => {
    if (HELIUS_RESPONSE.toUserAccount !== VAULT_PUBLIC_KEY) {
        res.send({
            message: "No solana transfered to vault."
        });
    }
    const fromAddress = HELIUS_RESPONSE.fromUserAccount;
    const toAddress = HELIUS_RESPONSE.toUserAccount;
    const amount = HELIUS_RESPONSE.amount;
    const type = "received_native_sol";

    if (type === "received_native_sol") {
        // await mintTokens(fromAddress, amount);
        await burnAndSendNativeTokens(fromAddress, amount);
    } else {
        // What could go wrong here?
        burnAndSendNativeTokens(fromAddress, amount);
    }

    res.send('Transaction successful');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});