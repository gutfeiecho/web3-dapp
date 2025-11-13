import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import CommunityAvatars from '@/components/community-avatars';
const option = {
  xAxis: {
    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27'],
  },
  yAxis: {},
  series: [
    {
      type: 'candlestick',
      data: [
        [20, 34, 10, 38],
        [40, 35, 30, 50],
        [31, 38, 33, 44],
        [38, 15, 5, 42],
      ],
    },
  ],
};
export function Dashboard() {
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {
      const chartEle = echarts.init(chartRef.current);
      chartEle.setOption(option);
    }
  }, []);
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
      {/* 中间内容 */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
          <div
            className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400"
            ref={chartRef}
          />
        </div>

        <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Tokens</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2">Name</th>
                <th className="text-right py-2">Balance</th>
                <th className="text-right py-2">Total Value</th>
                <th className="text-right py-2">Trade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="py-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                    ₿
                  </span>
                  Bitcoin
                </td>
                <td className="text-right">0.04321</td>
                <td className="text-right">$2,340.32</td>
                <td className="text-right">
                  <button className="bg-[#2c2c2c] px-3 py-1 rounded text-sm">
                    Trade
                  </button>
                </td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="py-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                    Ξ
                  </span>
                  Ethereum
                </td>
                <td className="text-right">1.2345</td>
                <td className="text-right">$3,890.12</td>
                <td className="text-right">
                  <button className="bg-[#2c2c2c] px-3 py-1 rounded text-sm">
                    Trade
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 右侧信息 */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Chain Allocation</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs">
                  ₿
                </span>
                Bitcoin
              </div>
              <span className="text-sm">$23.3B</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
            </div>
            <div className="text-right text-xs text-gray-400">71.68%</div>
          </div>
        </div>

        <div className="w-full bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
          <div className="flex w-full h-32 justify-center gap-2 mb-4">
            <CommunityAvatars />
          </div>
          <h3 className="font-semibold">Join Our Community</h3>
          <p className="text-sm text-gray-400 mt-1">
            Connect with other DeFi users and get early access.
          </p>
          <button className="w-full mt-3 bg-[#2c2c2c] px-4 py-2 rounded-lg text-sm transition">
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
