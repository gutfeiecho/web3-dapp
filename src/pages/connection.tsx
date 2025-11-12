import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers, formatUnits, parseUnits } from 'ethers';
import { MyTokenABI } from '../contracts/MyTokenABI.ts';
import { CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from '../contracts/contractConfig';

// 确保 SEPOLIA_CHAIN_ID 是 number 类型（建议在 contractConfig.ts 中定义为 11155111）
// 如果你目前是字符串或十六进制，请改为：
// export const SEPOLIA_CHAIN_ID = 11155111; // 十进制 number

type MyTokenContract = Contract & {
  balanceOf: (account: string) => Promise<bigint>;
  decimals: () => Promise<number>;
  transfer: (to: string, amount: bigint) => Promise<ethers.TransactionResponse>;
};

function ConnectionView() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  // provider是ethers.js库中的核心概念。它作为前端应用与以太网区块链之间的桥梁，用于读取链上数据、监听事件、获取网络信息
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  console.log("🚀 ~ ConnectionView ~ provider:", provider)
  const [contract, setContract] = useState<MyTokenContract | null>(null);
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask！');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      // ✅ 关键修复：将 bigint 转为 number 再比较
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        alert('请切换到 Sepolia 测试网！');
        return;
      }

      const tokenContract = new Contract(
        CONTRACT_ADDRESS,
        MyTokenABI,
        signer
      ) as MyTokenContract;

      setProvider(provider);
      setAccount(address);
      setContract(tokenContract);
      fetchBalance(address, tokenContract);
    } catch (err) {
      // 类型守卫：判断是否是 Error 实例
      if (err instanceof Error) {
        console.error(err);
        alert('连接失败: ' + err.message);
      } else if (typeof err === 'string') {
        // MetaMask 有时会抛出字符串错误（如 "User rejected the request"）
        console.error(err);
        alert('连接失败: ' + err);
      } else {
        // 兜底：可能是对象、null 等
        console.error('未知错误:', err);
        alert('连接失败: 未知错误');
      }
    }
  };

  const fetchBalance = async (addr: string, tokenContract: MyTokenContract) => {
    try {
      const balanceBigInt = await tokenContract.balanceOf(addr);
      const decimals = await tokenContract.decimals();

      // ✅ 安全地格式化为带小数的字符串（如 "123.4567"）
      const formatted = formatUnits(balanceBigInt, decimals);

      // 如果你想保留 4 位小数，可以转成 number 再 toFixed（但注意：仅当值不太大时安全）
      // 更稳妥的做法是直接显示字符串，或用 parseFloat + toFixed（适用于常规代币余额）
      const displayBalance = parseFloat(formatted).toFixed(4);

      setBalance(displayBalance);
    } catch (err) {
      console.error('Fetch balance error:', err);
      setBalance('Error');
    }
  };

  const handleTransfer = async () => {
    if (!contract || !toAddress || !amount) {
      alert('请填写完整信息');
      return;
    }

    try {
      setStatus('发送中...');

      const decimals = await contract.decimals();

      // ✅ 安全地将 "123.45" 转为 bigint（最小单位）
      let amountInWei: bigint;
      try {
        amountInWei = parseUnits(amount, decimals);
      } catch (_err) {
        throw new Error('金额格式无效，请输入数字');
      }

      // 可选：检查是否为正数（parseUnits 允许 0，但你可能不允许）
      if (amountInWei <= 0n) {
        throw new Error('金额必须大于 0');
      }

      const tx = await contract.transfer(toAddress, amountInWei);
      setStatus(`交易已提交: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setStatus('✅ 转账成功！');

      fetchBalance(account!, contract);
    } catch (err) {
      // 类型守卫：判断是否是 Error 实例
      if (err instanceof Error) {
        console.error(err);
        setStatus(`❌ 失败: ${err.message || '未知错误'}`);
      } else if (typeof err === 'string') {
        // MetaMask 有时会抛出字符串错误（如 "User rejected the request"）
        console.error(err);
        setStatus(`❌ 失败: ${err || '未知错误'}`);
      } else {
        // 兜底：可能是对象、null 等
        console.error('未知错误:', err);
        setStatus(`❌ 失败: ${'未知错误'}`);
      }
    }
  };

  // 👇 新增：监听网络切换
  useEffect(() => {
    const handleChainChanged = (_chainIdHex: string) => {
      // MetaMask 传入十六进制字符串，如 "0xaa36a7"
      const chainId = parseInt(_chainIdHex, 16);
      if (chainId !== SEPOLIA_CHAIN_ID) {
        alert('检测到网络切换，请保持在 Sepolia 测试网！');
      }
      // 无论是否正确，都刷新页面以确保状态一致（最简单可靠）
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // 👇 保留你原有的 accountsChanged 监听（可选）
  useEffect(() => {
    const handleAccountsChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>MyToken DApp</h1>

      {!account ? (
        <button onClick={connectWallet} style={buttonStyle}>
          连接 MetaMask
        </button>
      ) : (
        <>
          <div style={infoStyle}>
            账户: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <div style={infoStyle}>余额: {balance} MYT</div>

          <h2>转账</h2>
          <input
            type="text"
            placeholder="接收地址"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="数量"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...inputStyle, marginLeft: '10px' }}
          />
          <button onClick={handleTransfer} style={buttonStyle}>
            发送
          </button>
          {status && (
            <div
              style={{
                marginTop: '10px',
                color: status.includes('✅') ? 'green' : 'red',
              }}
            >
              {status}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
};

const infoStyle: React.CSSProperties = {
  background: '#f0f0f0',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '4px',
};

const inputStyle: React.CSSProperties = {
  padding: '8px',
  fontSize: '16px',
  width: '200px',
  marginRight: '10px',
};

export default ConnectionView;