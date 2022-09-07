type Props = {
  account: string | null | undefined;
  connect: Function;
  disconnect: Function;
  runTx: Function;
};

const Keplr: React.FC<Props> = ({
  account,
  connect,
  disconnect,
  runTx,
}) => (
  <div className="mt-10">
    <p>Keplr Wallet</p>
    <div className="flex gap-4">
      <button
        className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
        onClick={() => !!account ? disconnect() : connect()}
      >
        {!!account ? 'Disconnect Keplr': 'Connect Keplr'}
      </button>
      <button
        className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
        onClick={() => runTx()}
      >
        Run Transaction
      </button>
    </div>
  </div>
);

export default Keplr;