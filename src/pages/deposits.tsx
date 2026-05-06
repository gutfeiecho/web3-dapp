import React, { useState } from 'react';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi';
import farmAbi from '../contracts/SimpleYieldFarm.json';
import { MockTokenABI } from '../contracts/MockTokenABI.ts';
import { formatEther } from 'viem';

// 🔧 配置你的合约地址（替换成你实际部署的）
const TOKEN_ADDRESS = '0xAEb87b6BE94f99f4f5d105FCe443F1e9202b91BE' as const;
const FARM_ADDRESS = '0x5Fbe833a19B46fa47133950B80C1fC2A56D8249f' as const;

export const Deposits: React.FC = () => {
  const { address: account } = useAccount();
  const [depositAmount, setDepositAmount] = useState<string>('1000');

  // === 读取待领取收益 ===
  const {
    data: pendingReward,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useReadContract({
    address: FARM_ADDRESS,
    abi: farmAbi.abi,
    functionName: 'pendingReward',
    args: account ? [account as Address] : undefined,
    query: { enabled: !!account },
  });

  // === 写入：Approve + Deposit ===
  const {
    writeContractAsync: writeToken,
    isPending: isApproving,
    data: approveTxHash,
  } = useWriteContract();

  const {
    writeContractAsync: writeFarm,
    isPending: isDepositing,
    data: depositTxHash,
  } = useWriteContract();

  const { isLoading: isApproveMining } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: isDepositMining } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  // === 写入：Withdraw All ===
  const {
    writeContractAsync: withdrawAllAsync,
    isPending: isWithdrawing,
    data: withdrawTxHash,
  } = useWriteContract();

  const { isLoading: isWithdrawMining } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  // === 存入逻辑 ===
  const handleDeposit = async () => {
    if (!account) return;
    try {
      const amount = parseUnits(depositAmount, 18);

      // Step 1: Approve
      console.log('Approving...');
      const approveHash = await writeToken({
        address: TOKEN_ADDRESS,
        abi: MockTokenABI,
        functionName: 'approve',
        args: [FARM_ADDRESS, amount],
      });
      console.log('Approve tx:', approveHash);

      // Step 2: Deposit
      console.log('Depositing...');
      const depositHash = await writeFarm({
        address: FARM_ADDRESS,
        abi: farmAbi.abi,
        functionName: 'deposit',
        args: [amount],
      });
      console.log('Deposit tx:', depositHash);

      // 可选：交易完成后刷新数据
      await refetchPending();
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  // === 提现全部 ===
  const handleWithdrawAll = async () => {
    if (!account) return;
    try {
      const hash = await withdrawAllAsync({
        address: FARM_ADDRESS,
        abi: farmAbi.abi,
        functionName: 'withdrawAll',
      });
      console.log('Withdraw tx:', hash);
      await refetchPending();
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  // const formatEther = (value: bigint | undefined): number | string => {
  //   if (!value) return '0.0';
  //   return Number(value) / 1e18;
  // };

  const isBusy =
    isApproving ||
    isDepositing ||
    isWithdrawing ||
    isApproveMining ||
    isDepositMining ||
    isWithdrawMining;

  return (
    <div className="flex flex-col gap-5 w-full items-center justify-center">
      <h2 className="w-1/3 text-black text-2xl font-bold">Deposits</h2>
      <div className="w-1/3 mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Simple Yield Farm</h2>

        {!account ? (
          <p className="text-red-500">Please connect your wallet</p>
        ) : (
          <>
            {/* 待领取收益 */}
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Pending Reward</p>
              <p className="text-lg font-semibold text-black">
                {isPendingLoading
                  ? 'Loading...'
                  : `${formatEther(pendingReward as bigint)} MTKD`}
              </p>
            </div>

            {/* 存入表单 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Deposit Amount (MTK)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-2 border rounded text-black"
                placeholder="1000"
                disabled={isBusy}
              />
              <button
                onClick={handleDeposit}
                disabled={isBusy || !depositAmount}
                className={`w-full py-2 px-4 rounded ${
                  isBusy ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium`}
              >
                {isBusy ? 'Processing...' : 'Deposit'}
              </button>
            </div>

            {/* 提现按钮 */}
            <button
              onClick={handleWithdrawAll}
              disabled={isBusy}
              className={`w-full py-2 px-4 rounded ${
                isBusy ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              } text-white font-medium`}
            >
              Withdraw All + Claim Rewards
            </button>
          </>
        )}
      </div>
    </div>
  );
};
