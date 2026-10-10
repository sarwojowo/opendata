import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import ErrorPage from "./pages/ErrorPage";
import TruckLoader from "./components/loader/TruckLoader";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const PickUpLayout = lazy(() => import("./layouts/PickUpLayout"));

const ScreensaverPage = lazy(() => import("./pages/screensaver"));
const SelectStationPage = lazy(() => import("./pages/select-station"));
const HomePage = lazy(() => import("./pages/home"));
const BrowseProductPage = lazy(() => import("./pages/browse-product"));
const DetailProductPage = lazy(() => import("./pages/detail-product"));
const BrowseMerchantPage = lazy(() => import("./pages/browse-merchant"));
const DetailMerchantPage = lazy(() => import("./pages/detail-merchant"));
const CartPage = lazy(() => import("./pages/cart"));
const CheckoutPage = lazy(() => import("./pages/checkout"));
const PaymentQRISPage = lazy(() => import("./pages/payment/qris"));
const PaymentKMTPage = lazy(() => import("./pages/payment/kmt"));
const FinishOrderPage = lazy(() => import("./pages/finish-order"));

const PickUpHomePage = lazy(() => import("./pages/pickup/home"));
const PickUpVerificationPage = lazy(() => import("./pages/pickup/verification"));
const PickUpFinishPage = lazy(() => import("./pages/pickup/finish"));

const AppConfigPage = lazy(() => import("./pages/app-config"));

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Suspense fallback={<TruckLoader />}>
                <MainLayout />
            </Suspense>,
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <ScreensaverPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'select-station',
                    element: <SelectStationPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'home',
                    element: <HomePage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'browse-product',
                    element: <BrowseProductPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'browse-product/:slug',
                    element: <DetailProductPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'browse-merchant',
                    element: <BrowseMerchantPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'browse-merchant/:slug',
                    element: <DetailMerchantPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'cart',
                    element: <CartPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'checkout',
                    element: <CheckoutPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'payment-qris',
                    element: <PaymentQRISPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'payment-kmt',
                    element: <PaymentKMTPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'finish-order',
                    element: <FinishOrderPage />,
                    errorElement: <ErrorPage />
                }
            ]
        },
        {
            path: "/pick-up",
            element: <Suspense fallback={<TruckLoader />}>
                <PickUpLayout />
            </Suspense>,
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <PickUpHomePage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'verification',
                    element: <PickUpVerificationPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: 'finish',
                    element: <PickUpFinishPage />,
                    errorElement: <ErrorPage />
                },
            ]
        },
        {
            path: '/app-config',
            element: <Suspense fallback={<TruckLoader />}>
                <AppConfigPage />
            </Suspense>,
            errorElement: <ErrorPage />
        }
    ],
    { basename: import.meta.env.VITE_PUBLIC_URL }
);

export default router