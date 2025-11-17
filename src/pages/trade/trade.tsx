import { useState, useEffect, useRef } from 'react';
import { Repeat } from 'lucide-react';
import { ethers } from 'ethers';
import * as echarts from 'echarts';
import './index.css';

// MockToken ABI（只读余额）
const MOCK_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint250)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

const MOCK_TOKEN_ADDRESS = '0xAEb87b6BE94f99f4f5d105FCe443F1e9202b91BE';
const ETH_SYMBOL = 'ETH';

export const Trade = () => {
  const [fromToken, setFromToken] = useState<string>(ETH_SYMBOL);
  const [toToken, setToToken] = useState<string>('MTKD');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('0.5');
  const [gasEstimate, setGasEstimate] = useState<string>('$1.20');
  const [userBalance, setUserBalance] = useState<string>('--');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);

  // ECharts ref
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  // 获取 provider
  const getProvider = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  };

  const fetchBalance = async () => {
    const provider = getProvider();
    if (!provider || fromToken !== 'MTKD') {
      setUserBalance('--');
      return;
    }

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const tokenContract = new ethers.Contract(
        MOCK_TOKEN_ADDRESS,
        MOCK_TOKEN_ABI,
        provider
      );
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      setUserBalance(ethers.formatUnits(balance, decimals));
    } catch (err) {
      setUserBalance('0.0');
    }
  };

  const calculateToAmount = () => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount('');
      return;
    }

    const amount = parseFloat(fromAmount);
    if (fromToken === ETH_SYMBOL && toToken === 'MTKD') {
      setToAmount((amount * 2000).toFixed(6));
    } else if (fromToken === 'MTKD' && toToken === ETH_SYMBOL) {
      setToAmount((amount / 2000).toFixed(6));
    } else {
      setToAmount(amount.toFixed(6));
    }
  };

  useEffect(() => {
    calculateToAmount();
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => {
    const checkConnection = async () => {
      const provider = getProvider();
      if (provider) {
        try {
          const accounts = await provider.send('eth_accounts', []);
          setIsConnected(accounts.length > 0);
          if (accounts.length > 0) {
            fetchBalance();
          }
        } catch (e) {
          setIsConnected(false);
        }
      }
    };
    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      setIsConnected(accounts.length > 0);
      if (accounts.length > 0) fetchBalance();
    };

    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
      }
    };
  }, []);

  // 📊 初始化 ECharts 图表
  useEffect(() => {
    if (!chartRef.current) return;

    // 销毁旧实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // 生成模拟数据：过去 24 小时，每小时一个点
    const now = Date.now();
    const data = [];
    let price = 1.0; // 起始价 $1.00

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000);
      // 模拟小幅随机波动 ±2%
      price = price * (1 + (Math.random() - 0.5) * 0.04);
      data.push([time.getTime(), parseFloat(price.toFixed(4))]);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          const date = new Date(param.value[0]);
          return `
            <div>
              <strong>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><br/>
              Price: $${param.value[1].toFixed(4)}
            </div>
          `;
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          formatter: '${value}',
        },
        splitLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          data: data,
          type: 'line',
          smooth: true,
          lineStyle: { width: 2, color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
            ]),
          },
          showSymbol: false,
        },
      ],
      grid: {
        left: '4%',
        right: '4%',
        bottom: '12%',
        top: '8%',
        containLabel: true,
      },
    };

    chart.setOption(option);

    // 响应窗口大小变化
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []); // 只初始化一次

  const handleConnectWallet = async () => {
    if (!getProvider()) {
      alert('Please install MetaMask!');
      return;
    }
    setConnecting(true);
    try {
      const provider = getProvider()!;
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setIsConnected(true);
        fetchBalance();
      }
    } catch (err) {
      console.error('User rejected connection');
    } finally {
      setConnecting(false);
    }
  };

  const handleSwap = () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Enter an amount');
      return;
    }

    if (
      fromToken === 'MTKD' &&
      parseFloat(fromAmount) > parseFloat(userBalance || '0')
    ) {
      setError('Insufficient balance');
      return;
    }

    setError(null);
    alert(
      `✅ Swap initiated!\n${fromAmount} ${fromToken} → ${toAmount} ${toToken}\n(This is a demo — no real transaction sent.)`
    );
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Trade</h1>
      {/* Trade Card */}
      <div className="w-2xs">
        <div className="w-full flex gap-2">
          {/* Swap Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            {/* From */}
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                You pay
              </label>
              <div className="flex items-center border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent outline-none text-lg text-black"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="ml-2 bg-transparent outline-none font-medium text-black"
                >
                  <option value="ETH">ETH</option>
                  <option value="MTKD">MTKD</option>
                </select>
              </div>
              {fromToken === 'MTKD' && isConnected && (
                <div className="text-right text-sm text-blue-600 mt-1">
                  Balance: {parseFloat(userBalance).toFixed(4)}{' '}
                  <button
                    onClick={() => setFromAmount(userBalance)}
                    className="underline"
                  >
                    Max
                  </button>
                </div>
              )}
            </div>

            {/* Switch Button */}
            <div className="flex justify-center mt-4 mb-4">
              <Repeat color="#3e9392" />
            </div>

            {/* To */}
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                You receive
              </label>
              <div className="flex items-center border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.0"
                  className="w-full bg-transparent outline-none text-lg text-gray-500"
                />
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="ml-2 bg-transparent outline-none font-medium text-black"
                >
                  <option value="ETH">ETH</option>
                  <option value="MTKD">MTKD</option>
                </select>
              </div>
            </div>

            {/* Slippage & Gas */}
            <div className="flex justify-between text-xs text-gray-500 mb-4">
              <span>
                Slippage tolerance:
                <select
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="ml-1 bg-transparent outline-none underline"
                >
                  <option value="0.1">0.1%</option>
                  <option value="0.5">0.5%</option>
                  <option value="1">1%</option>
                </select>
              </span>
              <span>Estimated gas: {gasEstimate}</span>
            </div>

            {/* Error */}
            {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={connecting}
              className={`w-full py-3 rounded-lg font-medium ${
                connecting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isConnected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {connecting
                ? 'Connecting...'
                : isConnected
                  ? 'Swap'
                  : 'Connect Wallet'}
            </button>
          </div>
        </div>
        <div className="trade_card_baseline w-full rounded-xl -mt-6" />
      </div>
    </div>
  );
};
