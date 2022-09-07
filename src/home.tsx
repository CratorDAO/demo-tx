import { AccountData } from '@cosmjs/launchpad';
import { useState } from "react";
import useAuth from "./hooks/useAuth";
import Metamask from './components/Metamask';
import KeplrWallet from './components/Keplr';
import { Keplr, ChainInfo } from '@keplr-wallet/types';
import { SigningStargateClient } from '@cosmjs/stargate';
import { AssetConfig, Environment, loadAssets } from '@axelar-network/axelarjs-sdk';

require('dotenv');

declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }


const cosmos = {
  chainId: 'cosmoshub-4',
  restEndpoint: "https://api.cosmos.network",
  rpcEndpoint: 'https://cosmoshub-4--rpc--full.datahub.figment.io/apikey/6d8baa3d3e97e427db4bd7ffcfb21be4',
  chainInfo: {
    feeCurrencies: [
      { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
    ],
  } as ChainInfo,
  channelMap: { "axelar": "channel-293" }
};

const ALL_ASSETS: Promise<AssetConfig[]> = loadAssets({ environment: Environment.MAINNET });

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
    const keplr = window.keplr;
    if (!keplr) {
      alert('Please install keplr extension');
      return;
    }

    keplr.enable(cosmos.chainId);
    setKeplr(keplr);

    const offlineSigner = await keplr.getOfflineSignerAuto(cosmos.chainId);
    const [account] = await offlineSigner.getAccounts();
    setKeplrAccount(account);
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

    const offlineSigner = await keplr.getOfflineSignerAuto(cosmos.chainId);

    const client = await SigningStargateClient.connectWithSigner(
      cosmos.rpcEndpoint,
      offlineSigner,
    )

    try {
      const txObj = JSON.parse(tx);
      const recipient = txObj.to;
      const amount = txObj.value;
      const fee = txObj.gas;
      console.log('Tx Info:', keplrAccount.address, recipient, amount, fee);
      const result = await client.sendTokens(keplrAccount.address, recipient, [{ denom: 'uatom', amount }], { amount, gas: fee }, '');
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
        <p>Keplr Network: {cosmos.chainId ?? ''}</p>
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
