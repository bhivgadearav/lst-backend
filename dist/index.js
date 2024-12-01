"use strict";
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
exports.HELIUS_TOKEN_RESPONSE = exports.HELIUS_RESPONSE = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("./controllers");
const keys_1 = require("./keys");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.HELIUS_RESPONSE = { "amount": 100000000,
    "fromUserAccount": "CT4gHkBHaJKUgKnqeQJYSV4TJi4uL4vrjLaYg6VoaFKj",
    "toUserAccount": "6Y5qPUMEZ1fjs25R563vbSwG1vv8aKgn3LjTGUfLgs5h" };
exports.HELIUS_TOKEN_RESPONSE = { "fromTokenAccount": "BgnZyQVsi5L6YdGKAADA7pRqEStaL9CLP26VFcRP83Md",
    "fromUserAccount": "6Y5qPUMEZ1fjs25R563vbSwG1vv8aKgn3LjTGUfLgs5h",
    "mint": "5NJUkbB4dye8u2RFtXi617YqkAngmhvbPizadWW6N4YD",
    "toTokenAccount": "VDjd41UaWu6jTtHXwWRxRaVvevz4f7jvUfaXHexb8s5",
    "toUserAccount": "9DHsPEfBA7qPv9n2X942Hh1mud4ePSnbw4pvHNh98Eth",
    "tokenAmount": 1,
    "tokenStandard": "Fungible" };
app.post('/csol', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (exports.HELIUS_RESPONSE.toUserAccount !== keys_1.VAULT_PUBLIC_KEY) {
        res.send({
            message: "No solana transfered to vault."
        });
    }
    const fromAddress = exports.HELIUS_RESPONSE.fromUserAccount;
    const toAddress = exports.HELIUS_RESPONSE.toUserAccount;
    const amount = exports.HELIUS_RESPONSE.amount;
    const type = "received_native_sol";
    if (type === "received_native_sol") {
        // await mintTokens(fromAddress, amount);
        yield (0, controllers_1.burnAndSendNativeTokens)(fromAddress, amount);
    }
    else {
        // What could go wrong here?
        (0, controllers_1.burnAndSendNativeTokens)(fromAddress, amount);
    }
    res.send('Transaction successful');
}));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
