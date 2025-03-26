import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/auth-context";
import { Layout } from "./components/layout/layout";
import "./index.css";

// Public Pages
import HomePage from "./pages/home";
import ProductsPage from "./pages/products";
import ProductDetailPage from "./pages/product-detail";
import RequestInvoicePage from "./pages/request-invoice";
import ThankYouPage from "./pages/thank-you";
import AboutPage from "./pages/about";
import ContactPage from "./pages/contact";

// Admin Pages
import AdminLoginPage from "./pages/admin/login";
import AdminDashboardPage from "./pages/admin/dashboard";
import AdminProductsPage from "./pages/admin/products/index";
import AdminInvoiceRequestsPage from "./pages/admin/invoice-requests/index";
import AdminUsersPage from "./pages/admin/users/index";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/products"
              element={
                <Layout>
                  <ProductsPage />
                </Layout>
              }
            />
            <Route
              path="/products/:id"
              element={
                <Layout>
                  <ProductDetailPage />
                </Layout>
              }
            />
            <Route
              path="/request-invoice"
              element={
                <Layout>
                  <RequestInvoicePage />
                </Layout>
              }
            />
            <Route
              path="/request-invoice/:id"
              element={
                <Layout>
                  <RequestInvoicePage />
                </Layout>
              }
            />
            <Route
              path="/thank-you"
              element={
                <Layout>
                  <ThankYouPage />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoice-requests"
              element={
                <ProtectedRoute>
                  <AdminInvoiceRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);