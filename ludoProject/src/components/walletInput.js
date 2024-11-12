import React, { useState } from 'react';

const WalletInput = ({ playerColour, setWallet, setWinner }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setWallet(e.target.value);  
  };

  const handleSetWinner = () => {
    setWinner(inputValue);
    console.log("Winner is set to ", inputValue)
  };

  return (
    <div className='grid-2'> 
      <input 
        type='text'
        style={{width: '200px'}}
        placeholder={`${playerColour} wallet`}
        onChange={handleInputChange}
        value={inputValue}
      />
      <button onClick={handleSetWinner} style={{marginLeft: '13px'}}>Set Winner</button>
    </div>
  );
};

export default WalletInput;
