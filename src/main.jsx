import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './admin/App'
import './index.css'
import { RouterProvider, Routes, Route, createBrowserRouter } from 'react-router-dom';
// import { StoreFront } from './StoreFront';
// import { StoreAdmin } from './StoreAdmin';

export const App = () => {
    const router = createBrowserRouter(
        [
            {
                path: "*",
                element: (
                    <Routes>
                        {/* <Route path="/" element={<StoreFront />} /> */}
                        <Route path="/admin/*" element={<AdminApp />} />
                    </Routes>
                ),
            },
        ],
    );
    return <RouterProvider router={router} />;
};


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <AdminApp /> */}
  </StrictMode>
)
