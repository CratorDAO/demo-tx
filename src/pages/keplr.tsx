import { useState } from "react";
import { AccountData } from '@cosmjs/launchpad';
import { Keplr, ChainInfo } from '@keplr-wallet/types';
import { SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { AssetConfig, Environment, loadAssets } from '@axelar-network/axelarjs-sdk';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import Long from 'long';

require('dotenv');

declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }

const cosmos = {
  chainId: 'cosmoshub-4',
  restEndpoint: "https://api.cosmos.network",
  rpcEndpoint: `https://cosmos-mainnet-rpc.allthatnode.com:26657`,
  
  chainInfo: {
    feeCurrencies: [
      { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
    ],
  } as ChainInfo,
  channelMap: { "axelar": "channel-293" }
};

const environment = Environment.MAINNET;
const _denom = 'uusdc'; // decimal 6, eg. uusdc, uatom
const chainName = 'cosmoshub';
const TERRA_IBC_GAS_LIMIT = "150000"

const ALL_ASSETS: Promise<AssetConfig[]> = loadAssets({ environment });

const KeplrWallet = () => {
  const [tx, setTx] = useState('');
  const [wallet, setWallet] = useState<Keplr>();
  const [keplrAccount, setKeplrAccount] = useState<AccountData>();

  const connect = async () => {
    const keplr = window.keplr;
    if (!keplr) {
      alert('Please install keplr extension');
      return;
    }

    keplr.enable(cosmos.chainId);
    setWallet(keplr);

    const offlineSigner = await keplr.getOfflineSignerAuto(cosmos.chainId);
    const [account] = await offlineSigner.getAccounts();
    setKeplrAccount(account);
  };

  const disconnect = async () => {};
  const runKeplrTx = async () => {
    if (!wallet) {
      alert('Please install keplr extension');
      return;
    }
    if (!keplrAccount) {
      alert('Please connect Keplr wallet');
      return;
    }

    const offlineSigner = await wallet.getOfflineSignerAuto(cosmos.chainId);

    const client = await SigningStargateClient.connectWithSigner(
      cosmos.rpcEndpoint,
      offlineSigner,
    );

    // IBC transfer
    const PORT: string = "transfer";
    const AXELAR_CHANNEL_ID: string = cosmos.channelMap['axelar'];
    const allAssets = await ALL_ASSETS;
    const denom = allAssets.find((assetConfig) => assetConfig.common_key[environment] === _denom)?.chain_aliases[chainName]?.ibcDenom;

    if (!denom) {
      console.log('Asset not found:' + _denom);
      return;
    }

    const fee: StdFee = {
      gas: TERRA_IBC_GAS_LIMIT,
      amount: [{
        denom: cosmos.chainInfo.feeCurrencies[0].coinMinimalDenom,
        amount: '30000',
      }],
    };

    const timeoutHeight: Height = {
      revisionHeight: Long.fromNumber(10),
      revisionNumber: Long.fromNumber(10),
    };
    const timeoutTimestamp = 0;

    try {
      const txObj = JSON.parse(tx);
      const recipient = txObj.to;
      const amount = txObj.value;

      console.log(
        keplrAccount.address,
        recipient,
        Coin.fromPartial({
          denom,
          amount,
        }),
        PORT,
        AXELAR_CHANNEL_ID,
        timeoutHeight,
        timeoutTimestamp,
        fee,
      );

      const res = await client.sendIbcTokens(
        keplrAccount.address,
        recipient,
        Coin.fromPartial({
          denom,
          amount,
        }),
        PORT,
        AXELAR_CHANNEL_ID,
        timeoutHeight,
        timeoutTimestamp,
        fee,
      );
      console.log('Sent successfully', res);
    } catch (e) {
      console.log('Tx running error:', e);
    }
	};

  return (
    <div>
			<div className="mt-10">
				<p>Keplr Wallet (CosmosHub -&gt; Evm Chains)</p>
				<div className="flex gap-4">
					<button
						className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
						onClick={() => !!wallet ? disconnect() : connect()}
					>
						{!!wallet ? 'Disconnect Keplr': 'Connect Keplr'}
					</button>
					<button
						className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
						onClick={() => runKeplrTx()}
					>
						Run Transaction
					</button>
				</div>
			</div>

      <div className="mt-10 flex flex-col gap-4">
        <p>Keplr Status: {!!keplrAccount?.address ? 'Connected' : 'Disconnected'}</p>
        <p>Keplr Network: {cosmos.chainId ?? ''}</p>
        <p>Keplr Address: {keplrAccount?.address}</p>
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

export default KeplrWallet;
