import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Layout from './layout';
import { Dashboard } from './pages/dashboard';
import { Profile } from './pages/profile';
import { Protocols } from './pages/protocols';
import { Trade } from './pages/trade';
import { Deposits } from './pages/deposits';
import { Settings } from './pages/settings';

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: '/dashboard', Component: Dashboard },
      { path: '/deposits', Component: Deposits },
      { path: '/trade', Component: Trade },
      { path: '/protocols', Component: Protocols },
      { path: '/settings', Component: Settings },
      { path: '/profile', Component: Profile },
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}
export default App;
