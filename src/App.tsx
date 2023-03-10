import { Routes, Route } from 'react-router-dom';
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { AuthProvider } from "./hooks/useAuth";
import getLibrary from "./hooks/getLibrary";
import Layout from './pages/layout';
import MetamaskWallet from './pages/metamask';
import KeplrWallet from './pages/keplr';
import MultiversXWallet from './pages/multiversx';

const NetworkContextName = 'NETWORK';
const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MetamaskWallet />} />
              <Route path="metamask" element={<MetamaskWallet />} />
              <Route path="keplr" element={<KeplrWallet />} />
              <Route path="multiversx" element={<MultiversXWallet />} />
            </Route>
          </Routes>
          {/* <Home /> */}
        </AuthProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
}

export default App;
