import { useState, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// 合约配置
const AIRDROP_ADDRESS = "0xC9855e294DEe27E7D3f4C17AF15699bC3a80BFBA";
const TOKEN_ADDRESS = "0xb07ef8a5457832fF03Dfc8D5aE4402F9000180F7";
const TOKEN_DECIMALS = 18; // number 类型，用于 parseUnits

// ABIs
const AIRDROP_ABI = [
  {
    inputs: [
      { internalType: "address[]", name: "recipients", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    name: "multiTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function AirdropView() {
  const { address } = useAccount();
  const [recipientsInput, setRecipientsInput] = useState("0x...,0x...");
  const [amountPerUser, setAmountPerUser] = useState("10");
  const [status, setStatus] = useState("");

  // 读取代币余额
  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!], // 非空断言
    query: { enabled: !!address }, // 运行时保证只有address存在时才请求
  });

  // 授权相关
  // useWriteContract()是Wagmi提供的通用Hook，用于与智能合约交互并发起交易（非只读操作）
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract();

  // 空投相关
  const {
    writeContract: writeAirdrop,
    data: airdropHash,
    isPending: isAirdropping,
  } = useWriteContract();

  // 监听授权交易结果：成功后自动发起空投
  const {
    data: approveReceipt,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // 当授权交易成功时，触发空投
  useEffect(() => {
    if (isApproveSuccess) {
      const recipients = recipientsInput
        .split(',')
        .map(addr => addr.trim())
        .filter(Boolean);

      if (recipients.length === 0) {
        setStatus('未检测到有效地址');
        return;
      }

      try {
        const amounts = recipients.map(() =>
          parseUnits(amountPerUser, TOKEN_DECIMALS)
        );

        setStatus('正在执行空投...');
        writeAirdrop({
          address: AIRDROP_ADDRESS,
          abi: AIRDROP_ABI,
          functionName: 'multiTransferFrom',
          args: [recipients, amounts],
        });
      } catch (err) {
        console.error('构建空投参数失败:', err);
        setStatus('空投参数错误');
      }
    }
  }, [isApproveSuccess, approveReceipt, recipientsInput, amountPerUser, writeAirdrop]);

  // 处理授权失败
  useEffect(() => {
    if (isApproveError) {
      console.error('授权失败:', approveError);
      setStatus('授权交易失败');
    }
  }, [isApproveError, approveError]);

  // 监听空投交易结果
  const {
    isSuccess: isAirdropSuccess,
    isError: isAirdropError,
    error: airdropError,
  } = useWaitForTransactionReceipt({
    hash: airdropHash,
  });

  useEffect(() => {
    if (isAirdropSuccess) {
      setStatus('✅ 空投成功！');
    }
  }, [isAirdropSuccess]);

  useEffect(() => {
    if (isAirdropError) {
      console.error('空投失败:', airdropError);
      setStatus('❌ 空投交易失败');
    }
  }, [isAirdropError, airdropError]);

  const handleAirdrop = () => {
    if (!address) {
      alert('请先连接钱包');
      return;
    }

    const recipients = recipientsInput
      .split(',')
      .map(addr => addr.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      alert('请输入至少一个有效地址');
      return;
    }

    const totalAmount = BigInt(recipients.length) * parseUnits(amountPerUser, TOKEN_DECIMALS);

    // 检查余额是否足够（简单提示，非强制）
    if (balance && totalAmount > balance) {
      alert(`余额不足！需要 ${formatUnits(totalAmount, TOKEN_DECIMALS)} MTK，当前余额 ${formatUnits(balance, TOKEN_DECIMALS)} MTK`);
      return;
    }

    setStatus('正在授权代币...');
    writeApprove({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [AIRDROP_ADDRESS, totalAmount],
    });
  };

  // 格式化余额显示
  const formattedBalance = balance
    ? parseFloat(formatUnits(balance, TOKEN_DECIMALS)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    : '...';

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🪂 MTK 空投工具</h1>

      {address ? (
        <>
          <p>你的 MTK 余额: {formattedBalance} MTK</p>

          <div style={{ marginTop: '1rem' }}>
            <label>接收地址（用逗号分隔）:</label>
            <textarea
              value={recipientsInput}
              onChange={(e) => setRecipientsInput(e.target.value)}
              rows={4}
              style={{ width: '100%', marginTop: '0.5rem' }}
              placeholder="0xAbc...,0xDef..."
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label>每人空投数量 (MTK):</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amountPerUser}
              onChange={(e) => setAmountPerUser(e.target.value)}
              style={{ marginLeft: '0.5rem', width: '100px' }}
            />
          </div>

          <button
            onClick={handleAirdrop}
            disabled={isApproving || isAirdropping}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: isApproving || isAirdropping ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isApproving || isAirdropping ? 'not-allowed' : 'pointer',
            }}
          >
            {isApproving
              ? '授权中...'
              : isAirdropping
              ? '空投中...'
              : '开始空投'}
          </button>

          {status && (
            <p
              style={{
                marginTop: '1rem',
                color: status.includes('成功')
                  ? 'green'
                  : status.includes('失败')
                  ? 'red'
                  : '#3b82f6',
              }}
            >
              {status}
            </p>
          )}
        </>
      ) : (
        <p>请连接钱包</p>
      )}
    </div>
  );
}