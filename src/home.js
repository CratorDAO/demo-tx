import { useState } from "react";
import useAuth from "./hooks/useAuth";

const sendTransaction = async (data) => {
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [data],
    });
    return txHash;
  } catch (e) {
    console.log(e);
  }
}

const Home = () => {
  const { account, chainId, connect, disconnect } = useAuth();
  const [tx, setTx] = useState('');
  const [txHash, setTxHash] = useState('');

  const runTx = async () => {
    try {
      const txObj = JSON.parse(tx);
      const hash = await sendTransaction(txObj);
      setTxHash(hash);
    } catch (e) {
      console.log('Tx running error:', e);
    }
  }

  return (
    <div className="container mx-auto pt-10">
      <h1 className="text-3xl font-bold underline">
        Demo Transaction
      </h1>
      <div className="mt-10 flex gap-4">
        <button
          className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
          onClick={!!account ? disconnect : connect}
        >
          {!!account ? 'Disconnect Wallet': 'Connect Wallet'}
        </button>
        <button
          className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
          onClick={runTx}
        >
          Run Transaction
        </button>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <p>Connection Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>Selected Network: {chainId ?? ''}</p>
        <p>Wallet Address: {account}</p>
        <p>Returned TxHash: {txHash ?? ''}</p>
        <textarea
          className="border p-4 rounded"
          placeholder="Paste your txObject here"
          rows={10}
          autoFocus
          onChange={(e) => setTx(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}

export default Home;
