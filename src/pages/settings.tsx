import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const FARM_ABI = [
  'function rewardRate() view returns (uint256)',
  'function owner() view returns (address)',
  'function setRewardRate(uint256)',
];

const FARM_ADDRESS = '0x5Fbe833a19B46fa47133950B80C1fC2A56D8249f';

export const Settings = () => {
  const [protocolData, setProtocolData] = useState<{
    rewardRate: string;
    owner: string;
    isFrozen: boolean;
  } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [txStatus, setTxStatus] = useState<string>('');
  const [newRewardRate, setNewRewardRate] = useState<string>('');

  const getProvider = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  };

  const fetchProtocolData = async () => {
    const provider = getProvider();
    if (!provider) {
      setLoading(false);
      return;
    }

    try {
      const farmContract = new ethers.Contract(
        FARM_ADDRESS,
        FARM_ABI,
        provider
      );
      const [rewardRate, owner] = await Promise.all([
        farmContract.rewardRate(),
        farmContract.owner(),
      ]);

      const isFrozen = rewardRate === 0n;

      setProtocolData({
        rewardRate: ethers.formatUnits(rewardRate, 0),
        owner: owner,
        isFrozen: isFrozen,
      });

      // Check if connected account is owner
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setIsOwner(currentAddress.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRewardRate = async () => {
    if (!isOwner || !newRewardRate) return;

    const rate = BigInt(newRewardRate);
    if (rate < 0n) {
      alert('Reward rate must be non-negative');
      return;
    }

    setTxStatus('Sending transaction...');
    try {
      const provider = getProvider()!;
      const signer = await provider.getSigner();
      const farmContract = new ethers.Contract(FARM_ADDRESS, FARM_ABI, signer);
      const tx = await farmContract.setRewardRate(rate);
      setTxStatus('Waiting for confirmation...');
      await tx.wait();
      setTxStatus('✅ Success! Reward rate updated.');
      setNewRewardRate('');
      setTimeout(() => setTxStatus(''), 3000);
      fetchProtocolData(); // Refresh
    } catch (error: any) {
      console.error('Transaction failed', error);
      setTxStatus(`❌ Failed: ${error?.message || 'Unknown error'}`);
      setTimeout(() => setTxStatus(''), 5000);
    }
  };

  const handleFreeze = () => {
    setNewRewardRate('0');
  };

  const handleUnfreeze = () => {
    // Suggest a reasonable rate (e.g., 3.17e17 for ~100% APY)
    setNewRewardRate('317097919837645865'); // ≈ 3.17e17
  };

  useEffect(() => {
    fetchProtocolData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Protocol Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Protocol Information</h2>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Farm Contract:</span>
            <p className="font-mono text-blue-600 break-all">{FARM_ADDRESS}</p>
          </div>
          <div>
            <span className="text-gray-500">Owner:</span>
            <p className="font-mono">{protocolData?.owner}</p>
          </div>
          <div>
            <span className="text-gray-500">Current Reward Rate:</span>
            <p className="font-mono">
              {protocolData?.rewardRate} wei/sec per token
              {protocolData?.isFrozen && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  FROZEN
                </span>
              )}
            </p>
          </div>
        </div>

        {isOwner ? (
          <>
            <div className="mt-8">
              <h3 className="text-md font-medium mb-3">Admin Controls</h3>

              {/* Quick Actions */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleFreeze}
                  disabled={protocolData?.isFrozen}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    protocolData?.isFrozen
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Freeze Protocol
                </button>
                <button
                  onClick={handleUnfreeze}
                  disabled={!protocolData?.isFrozen}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    !protocolData?.isFrozen
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Unfreeze (100% APY)
                </button>
              </div>

              {/* Manual Input */}
              <div className="mt-4">
                <label className="block text-sm text-gray-500 mb-1">
                  Set Custom Reward Rate (wei/sec)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRewardRate}
                    onChange={(e) => setNewRewardRate(e.target.value)}
                    placeholder="e.g., 317097919837645865"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSetRewardRate}
                    disabled={!newRewardRate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip:
                  <code className="bg-gray-100 px-1 rounded">
                    317097919837645865
                  </code>{' '}
                  ≈ 100% APY,
                  <code className="bg-gray-100 px-1 rounded">0</code> = frozen.
                </p>
              </div>
            </div>

            {txStatus && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm ${
                  txStatus.includes('Success')
                    ? 'bg-green-100 text-green-800'
                    : txStatus.includes('Failed')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {txStatus}
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ You are not the protocol owner. Only the deployer can modify
              settings.
            </p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p>
            This interface allows the protocol owner to manage the reward
            emission rate. Freezing stops all future rewards — useful for
            stabilizing the protocol before user withdrawals.
          </p>
        </div>
      </div>
    </div>
  );
};
