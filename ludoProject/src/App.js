import "./styles/App.css";
import { useRecoilState, useRecoilValue } from "recoil";
import _ from "lodash";
import { Buffer } from 'buffer';
import React, { useState, useEffect } from 'react';


import * as states from "./recoil/atoms";


import {
  allCoinState,
  currentDiceState,
  currentPlayerState,
  currentPlayersListState,
} from "./recoil/atoms";

import HomeCenter from "./components/homeCenter";
import StepsGrid from "./components/stepsGrid";
import HomeBox from "./components/homeBox";
import GameSetup from "./components/gameSetup";
import { colorMap, moves, playerOrder } from "./config/constants";
import Walletinput from "./components/walletInput";

function Emulation() {
  const [currentPlayer, setCurrentPlayer] = useRecoilState(
    states.currentPlayerState
  );
  const [diceState, setDiceState] = useRecoilState(states.currentDiceState);
  const [blockState, setBlockState] = useRecoilState(states.allBlockState);
  const [coinState, setCoinState] = useRecoilState(states.allCoinState);
  const playersList = useRecoilValue(states.currentPlayersListState);

  // useEffect(() => {
  //   console.log(JSON.stringify({ blockState, coinState }, 0, 2));
  // }, [JSON.stringify(coinState), JSON.stringify(blockState)]);

  return (
    <div>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <button
          key={i}
          onClick={() => {
            setDiceState({
              num: i,
              isLocked: false,
              lastRolledBy: currentPlayer,
            });
          }}
        >
          {i}
        </button>
      ))}
      <br />
      {playersList.map((elem, i) => (
        <button
          key={i}
          onClick={() => {
            setCurrentPlayer(elem);
          }}
          style={{ backgroundColor: elem }}
        >
          {elem}
        </button>
      ))}
      <div>
        <span>Enter (eg; p1-t40): </span>
        <input
          type="text"
          onKeyUp={({ code, currentTarget: { value } }) => {
            if (code === "Enter") {
              if (value.match(/^[pyrt][0-3]-[pyrt]\d{2}$/)) {
                const [coinKey, boxKey] = value.split("-");
                const parent = colorMap[coinKey[0]];
                if (!playersList.includes(parent)) return;
                const oldPosition = coinState[parent][coinKey].position;

                setCoinState({
                  ...coinState,
                  [parent]: {
                    ...coinState[parent],
                    [coinKey]: { position: boxKey, isTurnAvailable: false },
                  },
                });

                const oldBlockState = _.cloneDeep(blockState);

                oldPosition &&
                  !oldPosition.includes("home") &&
                  oldBlockState[oldPosition].splice(
                    oldBlockState[oldPosition].indexOf(coinKey),
                    1
                  );

                setBlockState({
                  ...oldBlockState,
                  [boxKey]: [
                    ...new Set([...(oldBlockState[boxKey] || []), coinKey]),
                  ],
                });
              } else alert("Wrong input!");
            }
          }}
        ></input>
      </div>
    </div>
  );
}


function App() {
  const [player1Seed, setPlayer1Seed] = useState('');
  const [player2Seed, setPlayer2Seed] = useState('');
  const [winner, setWinner] = useState('');
  const [loser, setLoser] = useState('');
  const [transactionNum, setTransactionNum] = useState(0);
  const [conditionToUse, setConditionToUse] = useState('');
  const [fulfillmentforescrow, setfulfillment] = useState('');

  const handleSetWinner = (value) => {
    setWinner(value)
    if (winner === player1Seed) {
      setLoser(player2Seed);
      const myFulfillment = new cc.PreimageSha256(); 
      myFulfillment.setPreimage(Buffer.from("player 1 wins"));
      setfulfillment(myFulfillment.serializeBinary().toString('hex'));
    } else if (winner === player2Seed) {
      setLoser(player1Seed);
      const myFulfillment = new cc.PreimageSha256(); 
      myFulfillment.setPreimage(Buffer.from("player 2 wins"));
      setfulfillment(myFulfillment.serializeBinary().toString('hex'));
    }
    console.log("Winner set in App.js to: ", winner);
    console.log("Loser set in App.js to: ", loser === player1Seed ? player1Seed : player2Seed);
  };

  const handleWalletChange = (playerType, value) => {
    if (playerType === 'player1') {
      setPlayer1Seed(value);
      console.log("player1Seed: ", player1Seed)
    } else {
      setPlayer2Seed(value);
      console.log("player2Seed: ", player2Seed)
    }
  };

  useEffect(() => {
    console.log("player1Seed: ", player1Seed); 
    console.log("player2Seed: ", player2Seed); 
  }, [player1Seed, player2Seed]);

  const xrpl = require("xrpl");
const cc = require('five-bells-condition');


const createEscrow = async () => {
  
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const player1Wallet = xrpl.Wallet.fromSeed(player1Seed);
  const amount = 5000000; // Amount in drops
  const player2Wallet = xrpl.Wallet.fromSeed(player2Seed);

  if (!isValidAddress(player1Wallet.classicAddress) || !isValidAddress(player2Wallet.classicAddress)) {
    console.error("Invalid player1 seed or player2 address.");
    return;
  }

  const myFulfillment = new cc.PreimageSha256();
  myFulfillment.setPreimage(Buffer.from("player 1 wins"));
  const conditionHex = myFulfillment.getConditionBinary().toString('hex').toUpperCase();
  setConditionToUse(conditionHex)

  let finishAfter = new Date((new Date().getTime() / 1000) + 60); // 1 minutes from now
  finishAfter = new Date(finishAfter * 1000);

  const escrowCreateTransaction = {
    "TransactionType": "EscrowCreate",
    "Account": player1Wallet.classicAddress,
    "Destination": player2Wallet.classicAddress,
    "Amount": amount.toString(),
    "Condition": conditionHex,
    "Fee": "12",
    "FinishAfter": xrpl.isoTimeToRippleTime(finishAfter.toISOString()),
  };

  try {
    const response = await client.submitAndWait(escrowCreateTransaction, {  wallet: player1Wallet });
    setTransactionNum(response.result.ledger_index);
    console.log('Successfully created escrow:', response);
    console.log(transactionNum);
  } catch (error) {
    console.error('Error creating escrow:', error);
    console.error('Failed transaction:', escrowCreateTransaction);
  }
  finally {
    await client.disconnect();
  }
};

function isValidAddress(address) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address); 
}

  
  const finishEscrow = async () => {
    const seed = player1Seed
    const offerSequence = transactionNum;
    console.log(conditionToUse, fulfillmentforescrow)
    const condition = conditionToUse;
    const fulfillment = fulfillmentforescrow;
    console.log(fulfillment)
    try {
      // Connect ----------------------------------------------------------------
      const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
  
      // Prepare wallet to sign the transaction ---------------------------------
      const wallet = await xrpl.Wallet.fromSeed(seed);
      console.log("Wallet Address: ", wallet.address);
      console.log("Seed: ", seed);
  
      if((!offerSequence)|| (condition === "" || fulfillment === "")){
        console.log("offersequence", offerSequence);
        console.log("condition", condition);
        console.log("fulfillment", fulfillment);
          throw new Error("Please specify the sequence number, condition and fulfillment of the escrow you created");
      };
  
      const escrowFinishTransaction = {
          "Account": wallet.address,
          "TransactionType": "EscrowFinish",
          "Owner": wallet.address,
          // This should equal the sequence number of the escrow transaction
          "OfferSequence": offerSequence,
          // Crypto condition that must be met before escrow can be completed, passed on escrow creation
          "Condition": condition,
          // Fulfillment of the condition, passed on escrow creation
          "Fulfillment": fulfillment,
          
      };
  
      xrpl.validate(escrowFinishTransaction);
  
      // Sign and submit the transaction ----------------------------------------
      console.log('Signing and submitting the transaction:', JSON.stringify(escrowFinishTransaction, null,  "\t"));
      const response  = await client.submitAndWait(escrowFinishTransaction, { wallet });
      console.log("Transaction result:", response.result.meta.TransactionResult); if (response.result.meta.TransactionResult !== "tesSUCCESS") { console.error("Transaction failed:", response.result.meta); }
      console.log(`Finished submitting! ${JSON.stringify(response.result, null,  "\t")}`);
  
      await client.disconnect();
  
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <GameSetup />
      <div className="App">
        <div className="boardWrapper">
          <div className="innerRow">
            <HomeBox parent="palegreen" />
            <StepsGrid parent="yellow" adjacentDirection="leftOrTop" />
            <HomeBox parent="yellow" />
          </div>
          <div className="innerRow">
            <StepsGrid
              style={{ transform: "rotate(90deg)" }}
              parent="palegreen"
              adjacentDirection="rightOrBottom"
            />
            <HomeCenter />
            <StepsGrid
              style={{ transform: "rotate(90deg)" }}
              parent="royalblue"
              adjacentDirection="leftOrTop"
            />
          </div>
          <div className="innerRow">
            <HomeBox parent="tomato" />
            <StepsGrid parent="tomato" adjacentDirection="rightOrBottom" />
            <HomeBox parent="royalblue" />
          </div>
        </div>
        <br />
        {/* {process.env.NODE_ENV === "development" && <Emulation />} */}
        <div style={{marginTop: '50px'}}>
        <Walletinput playerColour="Player 1" setWinner={handleSetWinner} setWallet={(value) => handleWalletChange('player1', value)} />
        <Walletinput playerColour="Player 2" setWinner={handleSetWinner} setWallet={(value) => handleWalletChange('player2', value)} />
          <button onClick={createEscrow}>Create Escrow</button>
          <button onClick={finishEscrow}>Finish Escrow</button>
        </div>
      </div>
    </div>
  );
}

export default App;