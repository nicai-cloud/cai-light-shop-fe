import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Success from './pages/success.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Lights from './pages/lights.tsx'
import Light from './pages/light.tsx'
import Payment from './pages/payment.tsx'
import Checkout from './pages/checkout.tsx'
import { CartProvider } from './context/CartContext.tsx'
import Base from './pages/index.ts'
import { MainContextProvider } from './pages/context.tsx'
import { HOME_PAGE } from './utils/constants.ts'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to={HOME_PAGE} replace />,
      },
      {
        path: '/',
        element: <Base />,
        children: [
          {
            path: 'lights',
            element: <Lights />,
          },
          {
            path: 'light/:internal_name',
            element: <Light />,
          },
          {
            path: 'checkout',
            element: <Checkout />,
          },
          {
            path: 'payment',
            element: <Payment />,
          },
          {
            path: 'success',
            element: <Success />,
          },
        ]
      },
      {
        path: '*',
        element: <Navigate to={HOME_PAGE} replace />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <MainContextProvider>
        <RouterProvider router={router} />
      </MainContextProvider>
    </CartProvider>
  </StrictMode>
)
