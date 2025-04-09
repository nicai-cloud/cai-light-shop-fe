import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Success from './pages/success.tsx'
import PickupOrderSuccess from './pages/pickup-order-success.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Lights from './pages/lights.tsx'
import Light from './pages/light.tsx'
import ViewOrderSummary from './pages/view-order-summary.tsx'
import Payment from './pages/payment.tsx'
import Customer from './pages/customer.tsx'
import ConfirmOrderPickup from './pages/confirm-order-pickup.tsx'
import { CartProvider } from './context/CartContext.tsx'
import Base from './pages/index.ts'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/lights" replace />,
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
            path: 'view-order-summary',
            element: <ViewOrderSummary />,
          },
          {
            path: 'customer',
            element: <Customer />,
          },
          {
            path: 'payment',
            element: <Payment />,
          },
          {
            path: 'success',
            element: <Success />,
          },
          {
            path: 'confirm-order-pickup',
            element: <ConfirmOrderPickup />,
          },
          {
            path: 'pickup-order-success',
            element: <PickupOrderSuccess />,
          },
        ]
      },
      {
        path: '*',
        element: <Navigate to='/lights' replace />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
