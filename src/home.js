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
  const [encryptionPublicKey, setEncryptionPublicKey] = useState('');

  const runTx = async () => {
    try {
      const txObj = JSON.parse(tx);
      const hash = await sendTransaction(txObj);
      setTxHash(hash);
    } catch (e) {
      console.log('Tx running error:', e);
    }
  }

  const signMessage = async () => {
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [tx, account],
      });
      setTxHash(signature);
    } catch (e) {
      console.log('Signing error:', e);
    }
  }

  const getEncPubKey = async () => {
    try {
      const encryptionPublicKey = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
      });
      setEncryptionPublicKey(encryptionPublicKey);
    } catch (e) {
      console.log('Encryption error:', e);
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
        <button
          className="bg-blue-700 px-6 py-4 rounded text-white hover:bg-blue-800 active:bg-blue-900"
          onClick={signMessage}
        >
          Sign Message
        </button>
        <button
          className="bg-purple-700 px-6 py-4 rounded text-white hover:bg-purple-800 active:bg-purple-900"
          onClick={getEncPubKey}
        >
          Encryption Key
        </button>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <p>Connection Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>Selected Network: {chainId ?? ''}</p>
        <p>Wallet Address: {account}</p>
        <p>Returned TxHash: {txHash ?? ''}</p>
        <p>Encryption Public Key: {encryptionPublicKey ?? ''}</p>
        <textarea
          className="border p-4 rounded"
          placeholder={`
            Copy & Paste your Postman result(txData or msg) here
            e.g.(tx)
            {
              "from": "...",
              "data": "...",
              "to": "..."
            }
            e.g.(msg for sign)
            string here
          `}
          rows={10}
          autoFocus
          onChange={(e) => setTx(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}

export default Home;
