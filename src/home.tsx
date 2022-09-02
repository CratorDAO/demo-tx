import { getKeplrFromWindow } from '@keplr-wallet/stores';
import { AccountData, SigningCosmosClient } from '@cosmjs/launchpad';
import { useState } from "react";
import useAuth from "./hooks/useAuth";
import Metamask from './components/Metamask';
import KeplrWallet from './components/Keplr';
import { Keplr } from '@keplr-wallet/types';
import { SigningStargateClient } from '@cosmjs/stargate';

require('dotenv');

declare var window: any;
// const RPC_URL = process.env.RPC_URL || 'https://rpc.sentry-01.theta-testnet.polypore.xyz';
const keplrChainId = 'cosmoshub-4';

const sendTransaction = async (data: any) => {
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
  const [decryptedData, setDecryptedData] = useState('');
  const [keplr, setKeplr] = useState<Keplr>();
  const [keplrAccount, setKeplrAccount] = useState<AccountData>();

  const connectKeplr = async () => {
    const keplr = await getKeplrFromWindow();
    if (!keplr) {
      alert('Please install keplr extension');
      return;
    }

    keplr.enable(keplrChainId);
    setKeplr(keplr);

    const offlineSigner = keplr.getOfflineSigner(keplrChainId);
    const accounts = await offlineSigner.getAccounts();
    setKeplrAccount(accounts[0]);

  };
  const disconnectKeplr = async () => {};
  const runKeplrTx = async () => {
    if (!keplr) {
      alert('Please install keplr extension');
      return;
    }
    if (!keplrAccount) {
      alert('Please connect Keplr wallet');
      return;
    }

    const offlineSigner = keplr.getOfflineSigner(keplrChainId);

    // const client = new SigningCosmosClient(
    //   "https://lcd-cosmoshub.keplr.app/rest",
    //   keplrAccount.address,
    //   offlineSigner,
    // );
    const client = await SigningStargateClient.connectWithSigner(
      "https://rpc-osmosis.blockapsis.com",
      offlineSigner
    )

    try {
      const txObj = JSON.parse(tx);
      const recipient = txObj.to;
      const amount = txObj.value;
      const fee = txObj.gas;
      console.log('Tx Info:', keplrAccount.address, recipient, amount, fee);
      const result = await client.sendTokens(keplrAccount.address, recipient, amount, fee, '');
      console.log('Sent successfully', result);
    } catch (e) {
      console.log('Tx running error:', e);
    }
  };

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

  const decryptMessage = async () => {
    try {
      const callData = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [tx, account]
      });
      setDecryptedData(callData);
    } catch (e) {
      console.log('Encryption error:', e);
    }
  }

  return (
    <div className="container mx-auto pt-10">
      <h1 className="text-3xl font-bold underline">
        Demo Transaction
      </h1>
      <Metamask
        account={account}
        connect={connect}
        disconnect={disconnect}
        runTx={runTx}
        signMessage={signMessage}
        getEncPubKey={getEncPubKey}
        decryptMessage={decryptMessage}
      />
      <KeplrWallet
        account={keplrAccount?.address}
        connect={connectKeplr}
        disconnect={disconnectKeplr}
        runTx={runKeplrTx}
      />

      <div className="mt-10 flex flex-col gap-4">
        <p>Metamask Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>Metamask Network: {chainId ?? ''}</p>
        <p>Metamask Address: {account}</p>
        <p>Keplr Status: {!!keplrAccount?.address ? 'Connected' : 'Disconnected'}</p>
        <p>Keplr Network: {keplrChainId ?? ''}</p>
        <p>Keplr Address: {keplrAccount?.address}</p>
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
        <p className="break-all">Decrypted Data: {decryptedData ?? ''}</p>
      </div>
    </div>
  );
}

export default Home;
