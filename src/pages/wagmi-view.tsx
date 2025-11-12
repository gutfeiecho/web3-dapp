import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AccountInfo from './account-info';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
    appName: 'MTK Airdrop',
    projectId: 'test',
    chains: [sepolia],
    transports: {[sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/O5RGplAxuF3uQR5kMLAZF")}
});


const queryClient = new QueryClient();
function WagmiView() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <div className="p-4">
                        {/* <ConnectionView /> */}
                        <AccountInfo />
                        {/* <ConnectButton /> */}
                        {/* <AirdropView /> */}
                    </div>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default WagmiView;