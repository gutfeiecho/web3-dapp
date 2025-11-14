import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// 合约 ABI（最小化）
const FARM_ABI = [
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function getContractBalance() view returns (uint256)',
  'function owner() view returns (address)',
  'function setRewardRate(uint256)',
];

const TOKEN_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// 配置
const FARM_ADDRESS = '0x5Fbe833a19B46fa47133950B80C1fC2A56D8249f';
const TOKEN_ADDRESS = '0xAEb87b6BE94f99f4f5d105FCe443F1e9202b91BE';

export const Protocols = () => {
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [freezing, setFreezing] = useState(false);

  // 获取 provider（假设在浏览器环境）
  const getProvider = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  };

  const fetchData = async () => {
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
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );

      const [totalStaked, rewardRate, balance, owner, symbol, decimals] =
        await Promise.all([
          farmContract.totalStaked(),
          farmContract.rewardRate(),
          farmContract.getContractBalance(),
          farmContract.owner(),
          tokenContract.symbol(),
          tokenContract.decimals(),
        ]);

      // 计算 TVL（以代币计）
      const tvl = Number(ethers.formatUnits(totalStaked, decimals));
      const contractBalance = Number(ethers.formatUnits(balance, decimals));

      // 计算 APY（简化版：假设总质押 = TVL）
      // APY ≈ (rewardRate * 31536000 / totalStaked) * 100%
      let apy = 0;
      if (totalStaked > 0n) {
        const annualReward = rewardRate * 31536000n; // seconds in a year
        apy = Number(ethers.formatUnits(annualReward * 100n, decimals)) / tvl;
      }

      setProtocol({
        name: 'Simple Yield Farm',
        symbol,
        tvl,
        apy,
        contractBalance,
        rewardRate: Number(ethers.formatUnits(rewardRate, 0)),
        address: FARM_ADDRESS,
        tokenAddress: TOKEN_ADDRESS,
        owner,
      });

      // 检查当前连接地址是否为 owner
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setIsOwner(currentAddress.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error('Failed to fetch protocol data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async () => {
    if (!isOwner) return;
    setFreezing(true);
    try {
      const provider = getProvider();
      const signer = await provider!.getSigner();
      const farmContract = new ethers.Contract(FARM_ADDRESS, FARM_ABI, signer);
      const tx = await farmContract.setRewardRate(0);
      await tx.wait();
      alert('✅ Protocol frozen! Reward rate set to 0.');
      fetchData(); // 刷新数据
    } catch (error: any) {
      console.error('Freeze failed', error);
      alert('❌ Failed to freeze: ' + (error?.message || 'Unknown error'));
    } finally {
      setFreezing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 可选：监听链上事件或定期刷新
  }, []);

  if (loading) {
    return <div className="p-6">Loading protocols...</div>;
  }

  if (!protocol) {
    return (
      <div className="p-6 text-red-500">Failed to load protocol data.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Protocols</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{protocol.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Token: <span className="font-mono">{protocol.symbol}</span> ·
              Self-deployed · Owner: You
            </p>
            <p className="text-xs text-blue-600 mt-1 font-mono">
              Farm: {protocol.address.slice(0, 6)}...
              {protocol.address.slice(-4)}
            </p>
            <p className="text-xs text-green-600 font-mono">
              Token: {protocol.tokenAddress.slice(0, 6)}...
              {protocol.tokenAddress.slice(-4)}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={handleFreeze}
              disabled={freezing || protocol.apy === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                protocol.apy === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {protocol.apy === 0
                ? 'Frozen'
                : freezing
                  ? 'Freezing...'
                  : 'Freeze Protocol'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Value Locked (TVL)</p>
            <p className="text-lg font-bold">
              {protocol.tvl.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              {protocol.symbol}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Estimated APY</p>
            <p className="text-lg font-bold text-orange-600">
              {protocol.apy >= 1e6
                ? '>1M%'
                : protocol.apy.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) + '%'}
            </p>
            {protocol.apy > 10000 && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ Extremely high (test environment)
              </p>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Farm Balance</p>
            <p className="text-lg font-bold">
              {protocol.contractBalance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              {protocol.symbol}
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          <p>
            This protocol rewards users for staking {protocol.symbol}. Due to a
            high <code className="bg-gray-200 px-1 rounded">rewardRate</code> (
            {protocol.rewardRate}), the APY is unrealistically high — typical in
            test environments.
          </p>
          {isOwner && (
            <p className="mt-2">
              As the owner, you can freeze rewards to stabilize the protocol
              before withdrawal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
