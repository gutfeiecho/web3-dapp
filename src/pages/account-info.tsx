import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

// 代币列表（可扩展）
const TOKENS = [
  {
    name: "MyToken (MTK)",
    address: "0xb07ef8a5457832fF03Dfc8D5aE4402F9000180F7", // 替换为你的 MTK 地址
    decimals: 18,
  },
];

type TokenInfo = {
  name: string;
  address: string; // `0x${string}`; // 使用模板字面量类型（更严格）
  decimals: number;
  symbol?: string; // 可选，如果从链上读取
};

type TokenBalance = {
  symbol: string;
  balance: number;      // 格式化后的值（如 1000.5）
  raw?: bigint;          // 原始值（如 1000500000000000000000n）
  error?: boolean;      // 是否读取失败
};

type TokenBalances = {
  [contractAddress: string]: TokenBalance;
};
export default function AccountInfo() {
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({});

  // 自动读取所有代币余额
  useEffect(() => {
    if (!address) return;

    const fetchBalances = async () => {
      const balances: TokenBalances = {};
      for (const token of TOKENS) {
        try {
          const result = await window.ethereum.request({
            method: 'eth_call',
            params: [{
              to: token.address,
              // 这相当于直接调用合约的底层字节码，绕过了ABI解析，常用于轻量级读取。
              data: `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`
            }, 'latest']
          });

          const balanceHex = result || '0x0';
          const balance = BigInt(balanceHex);
          const formatted = Number(balance) / Math.pow(10, token.decimals);

          balances[token.address] = {
            symbol: token.name,
            balance: formatted,
            raw: balance,
          };
        } catch (err) {
          console.warn(`Failed to read ${token.name}:`, err);
          balances[token.address] = { symbol: token.name, balance: 0, error: true };
        }
      }
      setTokenBalances(balances);
    };

    fetchBalances();
  }, [address]);

  if (!address) {
    return <div style={{ padding: '2rem' }}>请先连接钱包</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🪪 账户信息</h2>
      
      <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <p><strong>地址:</strong></p>
        <p style={{ wordBreak: 'break-all', fontSize: '0.9em', color: '#333' }}>
          {address}
        </p>
        
        <p><strong>网络:</strong> {chain?.name || 'Unknown'}</p>
        
        <p><strong>ETH 余额:</strong> {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(6) : '...'} ETH</p>
      </div>

      <h3>💰 代币余额</h3>
      {TOKENS.map((token: TokenInfo) => {
        const bal = tokenBalances[token.address];
        return (
          <div key={token.address} style={{ 
            border: '1px solid #ddd', 
            padding: '0.8rem', 
            margin: '0.5rem 0', 
            borderRadius: '6px' 
          }}>
            <div><strong>{bal?.symbol || token.name}</strong></div>
            <div>合约: {token.address}</div>
            <div>余额: {bal ? (bal.error ? '❌ 读取失败' : `${bal.balance} ${token.symbol || ''}`) : '加载中...'}</div>
          </div>
        );
      })}

      <div style={{ marginTop: '2rem', fontSize: '0.9em', color: '#666' }}>
        <p>💡 提示：</p>
        <ul>
          <li>地址由私钥唯一生成，私钥 = 资产控制权</li>
          <li>代币余额存储在各代币合约中，非本地</li>
          <li>如未显示 MTK，请确认合约地址和网络正确</li>
        </ul>
      </div>
    </div>
  );
}