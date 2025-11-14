import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MOCK_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

const FARM_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function earned(address) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
];

const MOCK_TOKEN_ADDRESS = '0xAEb87b6BE94f99f4f5d105FCe443F1e9202b91BE';
const FARM_ADDRESS = '0x5Fbe833a19B46fa47133950B80C1fC2A56D8249f';

export const Profile = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [balances, setBalances] = useState<{
    wallet: number;
    staked: number;
    pendingRewards: number;
  }>({ wallet: 0, staked: 0, pendingRewards: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const getProvider = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  };

  const fetchUserData = async () => {
    const provider = getProvider();
    if (!provider) {
      setLoading(false);
      return;
    }

    try {
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      // 尝试解析 ENS（仅主网有效，测试网返回 null）
      try {
        const name = await provider.lookupAddress(userAddress);
        setEnsName(name);
      } catch (e) {
        setEnsName(null);
      }

      const tokenContract = new ethers.Contract(
        MOCK_TOKEN_ADDRESS,
        MOCK_TOKEN_ABI,
        provider
      );
      const farmContract = new ethers.Contract(
        FARM_ADDRESS,
        FARM_ABI,
        provider
      );
      const decimals = await tokenContract.decimals();

      const [walletBalance, staked, pendingRewards] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        farmContract.balanceOf(userAddress),
        farmContract.earned(userAddress),
      ]);

      setBalances({
        wallet: Number(ethers.formatUnits(walletBalance, decimals)),
        staked: Number(ethers.formatUnits(staked, decimals)),
        pendingRewards: Number(ethers.formatUnits(pendingRewards, decimals)),
      });
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    const provider = getProvider();
    if (!provider) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      await provider.send('eth_requestAccounts', []);
      fetchUserData();
    } catch (err) {
      console.error('User rejected connection');
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setEnsName(null);
    setBalances({ wallet: 0, staked: 0, pendingRewards: 0 });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading && !address) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!address) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to view your DeFi portfolio and interaction
            history.
          </p>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Format address for display
  const displayAddress =
    ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* Identity Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">{displayAddress}</p>
              <p className="text-sm text-gray-500">Connected Wallet</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyAddress}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Copy address"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={handleDisconnect}
              className="p-2 text-red-500 hover:text-red-700"
              title="Disconnect"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="text-lg font-bold mt-1">
            {balances.wallet.toFixed(4)} MTKD
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Staked in Farm</p>
          <p className="text-lg font-bold mt-1 text-green-600">
            {balances.staked.toFixed(4)} MTKD
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Pending Rewards</p>
          <p className="text-lg font-bold mt-1 text-orange-600">
            {balances.pendingRewards.toFixed(4)} MTKD
          </p>
        </div>
      </div>

      {/* Activity History (Mock) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Stake into Yield Farm</span>
            <span className="text-green-600">-500 MTKD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Claim Rewards</span>
            <span className="text-orange-600">+12.5 MTKD</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>No more recent activity</span>
            <span>—</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 Tip: Your on-chain activity is public. This list would be populated
          from event logs in a production app.
        </p>
      </div>
    </div>
  );
};
