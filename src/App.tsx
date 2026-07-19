import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './services/authContext';
import { queryClient } from './services/queryClient';
import { AdminRoute } from './services/RoleRoute';
import { ConfirmProvider } from './hooks/useConfirm';
import { HIDE_CHROME_ROUTES, ROUTES } from './constants/routes';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Faq from './pages/public/Faq';
import NotFoundPage from './pages/public/NotFound';
import Catalog from './pages/public/Catalog';
import Blog from './pages/public/Blog';
import ArticleDetail from './pages/public/ArticleDetail';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Profile from './pages/user/Profile';
import ManageAppointments from './pages/user/ManageAppointments';
import ManageEvents from './pages/user/ManageEvents';
import CustomRequest from './pages/user/CustomRequest';
import ManageTestimonials from './pages/user/ManageTestimonials';
import TestimonialForm from './pages/user/TestimonialForm';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageReviews from './pages/admin/ManageReviews';
import ManageServices from './pages/admin/ManageServices';
import ManageAvailability from './pages/admin/ManageAvailability';
import ManageAppointmentsAdmin from './pages/admin/ManageAppointmentsAdmin';
import ManageEventsAdmin from './pages/admin/ManageEventsAdmin';
import EventForm from './pages/admin/EventForm';
import ManageArticles from './pages/admin/ManageArticles';
import ArticleForm from './pages/admin/ArticleForm';
import ProductsAdmin from './pages/admin/ProductsAdmin';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_ROUTES.has(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <Header />}
      <main className={`flex-grow ${!hideChrome ? 'pt-20' : ''}`}>{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.FAQ} element={<Faq />} />
              <Route path={ROUTES.BLOG} element={<Blog />} />
              <Route path={ROUTES.BLOG_DETAIL()} element={<ArticleDetail />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path={ROUTES.CATALOG} element={<Catalog />} />

              {/* Authenticated (user or admin) */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <AdminRoute allowedRoles={[1, 2]}>
                    <Profile />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.APPOINTMENTS}
                element={
                  <AdminRoute allowedRoles={[1, 2]}>
                    <ManageAppointments />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.EVENTS}
                element={
                  <AdminRoute allowedRoles={[1, 2]}>
                    <ManageEvents />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.CUSTOM_REQUEST}
                element={
                  <AdminRoute allowedRoles={[1, 2]}>
                    <CustomRequest />
                  </AdminRoute>
                }
              />
              <Route path={ROUTES.TESTIMONIALS} element={<ManageTestimonials />} />
              <Route
                path={ROUTES.TESTIMONIALS_NEW}
                element={
                  <AdminRoute allowedRoles={[1, 2]}>
                    <TestimonialForm />
                  </AdminRoute>
                }
              />

              {/* Admin only */}
              <Route
                path={ROUTES.ADMIN}
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_USERS}
                element={
                  <AdminRoute>
                    <ManageUsers />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_REVIEWS}
                element={
                  <AdminRoute>
                    <ManageReviews />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_SERVICES}
                element={
                  <AdminRoute>
                    <ManageServices />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_BLOG}
                element={
                  <AdminRoute>
                    <ManageArticles />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_BLOG_NEW}
                element={
                  <AdminRoute>
                    <ArticleForm />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_BLOG_EDIT()}
                element={
                  <AdminRoute>
                    <ArticleForm />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_EVENTS}
                element={
                  <AdminRoute>
                    <ManageEventsAdmin />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_EVENTS_NEW}
                element={
                  <AdminRoute>
                    <EventForm />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_EVENTS_EDIT()}
                element={
                  <AdminRoute>
                    <EventForm />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_APPOINTMENTS}
                element={
                  <AdminRoute>
                    <ManageAppointmentsAdmin />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_AVAILABILITY}
                element={
                  <AdminRoute>
                    <ManageAvailability />
                  </AdminRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_PRODUCTS}
                element={
                  <AdminRoute>
                    <ProductsAdmin />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
        </ConfirmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;