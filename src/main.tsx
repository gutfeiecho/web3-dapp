import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@rainbow-me/rainbowkit/styles.css';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'MTK Airdrop',
  projectId: 'test',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      'https://eth-sepolia.g.alchemy.com/v2/O5RGplAxuF3uQR5kMLAZF'
    ),
  },
});
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
