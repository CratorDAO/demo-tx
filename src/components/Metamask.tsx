type Props = {
  account: string | null | undefined;
  connect: Function;
  disconnect: Function;
  runTx: Function;
  signMessage: Function;
  getEncPubKey: Function;
  decryptMessage: Function;
};

const Metamask: React.FC<Props> = ({
  account,
  connect,
  disconnect,
  runTx,
  signMessage,
  getEncPubKey,
  decryptMessage,
}) => (
  <div className="mt-10 flex gap-4">
    <button
      className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
      onClick={() => !!account ? disconnect() : connect()}
    >
      {!!account ? 'Disconnect Metamask': 'Connect Metamask'}
    </button>
    {/* <button
      className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
      onClick={!!keplrAddress ? disconnect : connectKeplr}
    >
      {!!keplrAddress ? 'Disconnect Keplr': 'Connect Keplr'}
    </button> */}
    <button
      className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
      onClick={() => runTx()}
    >
      Run Transaction
    </button>
    <button
      className="bg-blue-700 px-6 py-4 rounded text-white hover:bg-blue-800 active:bg-blue-900"
      onClick={() => signMessage()}
    >
      Sign Message
    </button>
    <button
      className="bg-purple-700 px-6 py-4 rounded text-white hover:bg-purple-800 active:bg-purple-900"
      onClick={() => getEncPubKey()}
    >
      Encryption Key
    </button>
    <button
      className="bg-orange-700 px-6 py-4 rounded text-white hover:bg-orange-800 active:bg-orange-900"
      onClick={() => decryptMessage()}
    >
      Decrypt Message
    </button>
  </div>
)

export default Metamask;