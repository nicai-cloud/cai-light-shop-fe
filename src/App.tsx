import { Outlet } from 'react-router-dom'
import ScrollToTop from './utils/scroll-to-top';

function App() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

export default App
