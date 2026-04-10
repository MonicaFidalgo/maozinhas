import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/dm-sans/300.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import './index.css'

import App from './App'
import Home from './pages/Home'
import AnimalDetail from './pages/AnimalDetail'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './components/ProtectedRoute'
import Apoiar from './pages/Apoiar'
import AcceptInvite from './pages/AcceptInvite'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'animal/:slug', element: <AnimalDetail /> },
      { path: 'apoiar', element: <Apoiar /> },
      { path: 'admin/login', element: <AdminLogin /> },
      { path: 'accept-invite', element: <AcceptInvite /> },
      {
        path: 'admin',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <AdminPanel /> },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)
