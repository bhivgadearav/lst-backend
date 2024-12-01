## Assignment
1. Complete the functions in `mintTokens.ts` and `burnTokens.ts` to mint and burn tokens.
2. Complete the function in `sendNativeTokens.ts` to send native tokens.
3. Run the server using `npm run start` and test the functionality using the `curl` command.
4. Add logic to send different amounts of sol and lst based on time passed since the site was deployed/first ever minting happened since deployment
5. Get alchemy links for devnet and mainnet

## Better approach
What can be a better approach to this problem?

## Hints
 - Can you store all incoming events in a DB?
 - Can you think of what is wrong in line 16 of index.ts?
 - How can you ensure you are not double minting tokens?
 - How can you ensure that you're not burning tokens without sending them to the receiver?
