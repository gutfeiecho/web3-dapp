import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
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
    <div className="flex flex-col gap-5">
      <h2 className="text-black text-2xl font-bold">Overview</h2>
      <div className="flex flex-col gap-2">
        {/* top内容 */}
        <div className="flex gap-2 w-full h-100">
          <div className="w-5/7 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Portfolio Performance
            </h2>
            <div
              className="h-64 rounded-lg flex items-center justify-center text-gray-400"
              ref={chartRef}
            />
          </div>

          <div className="w-2/7 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Swap crypto</h2>
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
        </div>

        {/* 右侧信息 */}
        <div className="w-full bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left w-1/7">商品</th>
                <th className="text-center w-1/7">价格</th>
                <th className="text-center w-1/7">涨跌幅（24小时）</th>
                <th className="text-center w-1/7">总市值</th>
                <th className="text-center w-1/7">美元成交量（24小时）</th>
                <th className="text-center w-1/7">流通供应量</th>
                <th className="text-cemter w-1/7">成交量/市值</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-800/50">
                <td className="flex items-center justify-start">
                  <svg
                    width="18"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#F7931A" d="M0 0h18v18H0z" />
                    <path
                      d="M12.836 7.94c.166-1.123-.684-1.721-1.855-2.128l.38-1.513-.926-.23-.369 1.476-.738-.177.375-1.486-.925-.23-.38 1.518-.588-.139v-.005l-1.278-.32-.246.988s.684.16.674.166c.374.096.438.342.427.535L6.96 8.128l.096.032-.102-.022-.604 2.423c-.043.112-.16.283-.423.214.011.016-.668-.16-.668-.16l-.46 1.053 1.203.3.658.17-.385 1.535.925.23.374-1.519.744.193-.38 1.513.925.23.38-1.535c1.577.3 2.765.182 3.262-1.246.401-1.15-.021-1.807-.85-2.246.604-.133 1.059-.534 1.176-1.353h.005zm-2.112 2.963c-.283 1.15-2.219.524-2.845.374l.508-2.037c.626.16 2.637.465 2.337 1.658v.005zm.284-2.979c-.257 1.043-1.872.514-2.39.385l.46-1.844c.523.128 2.202.374 1.93 1.46z"
                      fill="#fff"
                    />
                  </svg>
                  <span>Bitcoin</span>
                </td>
                <td className="w-1/7 text-center">77,701.18 USD</td>
                <td className="w-1/7 text-center">+0.29%</td>
                <td className="w-1/7 text-center">1.56T USD</td>
                <td className="w-1/7 text-center">26.78B USD</td>
                <td className="w-1/7 text-center">20.03M</td>
                <td className="w-1/7 text-center">0.0172</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="w-1/7 text-center">Ethereum</td>
                <td className="w-1/7 text-center">2,130.27 USD</td>
                <td className="w-1/7 text-center">-0.01%</td>
                <td className="w-1/7 text-center">257.09B USD</td>
                <td className="w-1/7 text-center">12.13B USD</td>
                <td className="w-1/7 text-center">120.69M</td>
                <td className="w-1/7 text-center">0.0472</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
