import { Outlet } from 'react-router-dom'
import ScrollToTop from './utils/scroll-to-top';
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6Ld9knUrAAAAAH5S5eQE9FT2SwF7zKaI-YmeHbpB">
      <ScrollToTop />
      <Outlet />
    </GoogleReCaptchaProvider>
  )
}

export default App
