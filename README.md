# game-on-chain
Purpose

•⁠  ⁠The inspiration behind this project stems from a desire to enhance the trust and transparency in online multiplayer gaming by leveraging a ledger system.
Specifically, XRP’s fast transaction speeds and especially low fees make it an ideal solution for this sort of decentralised escrow system. By using XRP as a medium for the game’s wager,
players can have confidence that the prize is safely locked in escrow and will be automatically released to the winner without the need for intermediaries. This not only reduces the
risk of fraud but also ensures that the transaction process is quick and cost-effective.

Description

•⁠  ⁠My project features a game that is a two-player competitive experience where players wager an agreed-upon amount of XRP, which is held in escrow for the duration of the match. The gameplay is based on
*Ludo*, a classic board game where players race to move their pieces from start to finish based on dice rolls, all while trying to capture their opponent’s pieces. The winner of the
game is the first player to successfully navigate their pieces to the finish line. To ensure fairness and security, the wagered XRP is locked in escrow at the start of the game and is
automatically transferred to the winner once the match concludes. This serves as a prime example of a part of a broader idea of a larger repository of comeptitive games that can be played
on a web-connected device. All players need to do is enter their wallet addresses when prompted and their XRP amounts will be held in escrow until the game finishes.

How it was built and challenges

•⁠  ⁠I made use of Node JS to write the integrated front-end and back-end for the web app, and therefore could use the XRP libraries on JS. After getting a little inspiration from numerous github
repos, I created the interface. It took about a week to get familiar with all the xrp functions and use cases, through the xrp documentation. After that, it was slightly easier to create
the escrow and fulfillments and finish them as well, however I did run into a lot of dependancy issues and a lot of type issues: My seed went from string to encoded base64 and finally to
encoded hex, and the same for my fulfillments and escrows. After that, there was a slight issue with the address being a 32 byte buffer, and so again I had to figure out how to use Buffer.from,
without getting dependacy issues again. I used testnet to try out my projects, with sample seeds and accounts. It was a good way to keep track of my escrows and whether they went through or not.

What I learned

•⁠  ⁠Finally, this project gave me a good understanding of the XRP Ledger system. Implementing escrow functionality gave me hands-on experience with securely locking and releasing funds
conditionally, making transactions transparent and trustless. Beyond just escrows, I also learned how the XRP Ledger handles transactions with extremely fast processing times and minimal
fees. The simplicity of executing these transactions within the XRP ecosystem was eye-opening compared to other more complex blockchains, and it reinforced why XRP is a great fit for real-time
applications like this. Using testnet gave me a very good idea of how the system processes transactions and escrows, and shows them to the user.

Installation and Deployment

•⁠  ⁠One can download the files, including the node modules and run it using the command "npm start" in the project terminal. This will start running on the localhost on port 3000. Here, two
players can connect their wallets and play the game of ludo. As of right now, the code's functionality extends as much as creating the escrow, setting one of the players as the winner
and then finishing the escrow. The game is also limited in that only player 2 can win, as only one escrow is set up. If player 1 is set to be the winner, the escrow will not go through.
This again serves as an example of how it would be implemented. In this case there would be two escrows genertaed, since that is the way xrp works. Only one escrow goes through while the other
fails.
