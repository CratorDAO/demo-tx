import { useState } from 'react';
import { ExtensionProvider } from '@elrondnetwork/erdjs-extension-provider'

const MaiarWallet: React.FC = () => {
  const [account, setAccount] = useState('');
  const [tx, setTx] = useState('');

  const connect = async () => {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    await provider.login();
    const address = await provider.getAddress();
    setAccount(address);
  };

  const disconnect = () => {
    console.log('disconnect');
  };

  const runTx = () => {
    
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