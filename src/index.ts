import express, { Request, Response } from 'express';
import { burnAndSendNativeTokens, mintTokens } from './controllers';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post('/csol', async (req: Request, res: Response): Promise<void> => {
    const { amount, userAddress, type } = req.body;

    if (!amount || !userAddress || !type) {
        res.status(400).send('Invalid request');
        return;
    }

    if (type === 'mint') {
        await mintTokens(userAddress, amount);
    } else if (type === 'burn') {
        await burnAndSendNativeTokens(userAddress, amount);
    } else {
        res.status(400).send('Invalid request');
        return;
    }

    res.send('Transaction successful');
    return;
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});