import { useState } from 'react';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider';
import { Address, Transaction, TransactionPayload, TransactionVersion } from '@elrondnetwork/erdjs';
import axios from 'axios';

const ELROND_API_URL = 'https://gateway.elrond.com/transaction';

const MaiarWallet: React.FC = () => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<ExtensionProvider>();
  const [tx, setTx] = useState('');
  const [txHash, setTxHash] = useState('');

  const connect = async () => {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    await provider.login();
    const address = await provider.getAddress();
    setAccount(address);
    setProvider(provider);
  };

  const disconnect = async () => {
    await provider?.logout();
    const address = await provider?.getAddress();
    setAccount(address || '');
    setProvider(provider);
  };

  const runTx = async () => {
    const txObj = JSON.parse(tx);
    let nonce = 0;
    try {
      const res = await axios.get(`${ELROND_API_URL}/pool?by-sender=${txObj.from}&last-nonce=true`);
      nonce = res.data.data;
    } catch (e) {
      console.log(e);
    }

    const t: Transaction = new Transaction({
      nonce,
      value: txObj.value,
      receiver: new Address(txObj.to),
      sender: new Address(txObj.from),
      gasPrice: Number(txObj.gas),
      gasLimit: 50000000,
      data: new TransactionPayload(txObj.data),
      chainID: '1',
      version: new TransactionVersion(1),

    });
    const signedTx = await provider?.signTransaction(t);

    // Send signed transaction
    const params = {
      nonce: signedTx?.getNonce(),
      value: signedTx?.getValue().toString(),
      receiver: signedTx?.getReceiver().bech32(),
      sender: signedTx?.getSender().bech32(),
      gasPrice: signedTx?.getGasPrice(),
      gasLimit: signedTx?.getGasLimit(),
      data: signedTx?.getData().encoded(),
      signature: signedTx?.getSignature().hex(),
      chainID: signedTx?.getChainID(),
      version: signedTx?.getVersion().valueOf(),
      options: signedTx?.getOptions().valueOf(),
    };

    const { data } = await axios.post(`${ELROND_API_URL}/send`, params);

    setTxHash(data.data.txHash);
  };

  return (
    <div>
			<div className="mt-10">
				<p>Maiar Wallet (Elrond -&gt; Ethereum)</p>
				<div className="flex gap-4">
					<button
						className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
						onClick={() => !account ? connect() : disconnect()}
					>
						{!!account ? 'Disconnect Maiar': 'Connect Maiar'}
					</button>
					<button
						className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
						onClick={() => runTx()}
					>
						Run Transaction
					</button>
				</div>
			</div>

      <div className="mt-10 flex flex-col gap-4">
        <p>Maiar Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>Maiar Address: {account}</p>
        <p>Returned TxHash: {txHash ?? ''}</p>
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
};

export default MaiarWallet;