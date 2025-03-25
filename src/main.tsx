import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Success from './pages/success.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Preselections from './pages/preselections.tsx'
import Preselection from './pages/preselection.tsx'
import ViewOrderSummary from './pages/view-order-summary.tsx'
import ConfirmOrder from './pages/confirm-order.tsx'
import { CartProvider } from './context/CartContext.tsx'
import Base from './pages/index.ts'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/preselections" replace />,
      },
      {
        path: '/',
        element: <Base />,
        children: [
          {
            path: 'preselections',
            element: <Preselections />,
          },
          {
            path: 'preselection/:name',
            element: <Preselection />,
          },
          {
            path: 'view-order-summary',
            element: <ViewOrderSummary />,
          },
          {
            path: 'confirm-order',
            element: <ConfirmOrder />,
          },
          {
            path: 'success',
            element: <Success />,
          },
        ]
      },
      {
        path: '*',
        element: <Navigate to='/preselections' replace />,
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
