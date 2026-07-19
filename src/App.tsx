import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './services/authContext';
import { queryClient } from './services/queryClient';
import { AdminRoute } from './services/RoleRoute';
import { ConfirmProvider } from './hooks/useConfirm';
import { HIDE_CHROME_ROUTES, ROUTES } from './constants/routes';
import Header from './components/Header';
import Footer from './components/Footer';
import PageSkeleton from './components/PageSkeleton';

const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Faq = lazy(() => import('./pages/public/Faq'));
const NotFoundPage = lazy(() => import('./pages/public/NotFound'));
const Catalog = lazy(() => import('./pages/public/Catalog'));
const Blog = lazy(() => import('./pages/public/Blog'));
const ArticleDetail = lazy(() => import('./pages/public/ArticleDetail'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const Profile = lazy(() => import('./pages/user/Profile'));
const ManageAppointments = lazy(() => import('./pages/user/ManageAppointments'));
const ManageEvents = lazy(() => import('./pages/user/ManageEvents'));
const CustomRequest = lazy(() => import('./pages/user/CustomRequest'));
const ManageTestimonials = lazy(() => import('./pages/user/ManageTestimonials'));
const TestimonialForm = lazy(() => import('./pages/user/TestimonialForm'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageReviews = lazy(() => import('./pages/admin/ManageReviews'));
const ManageServices = lazy(() => import('./pages/admin/ManageServices'));
const ManageAvailability = lazy(() => import('./pages/admin/ManageAvailability'));
const ManageAppointmentsAdmin = lazy(() => import('./pages/admin/ManageAppointmentsAdmin'));
const ManageEventsAdmin = lazy(() => import('./pages/admin/ManageEventsAdmin'));
const EventForm = lazy(() => import('./pages/admin/EventForm'));
const ManageArticles = lazy(() => import('./pages/admin/ManageArticles'));
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_ROUTES.has(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-sgreen focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:ring-2 focus:ring-sgreen"
      >
        Saltar al contenido principal
      </a>
      {!hideChrome && <Header />}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-grow ${!hideChrome ? 'pt-20' : ''}`}
      >
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
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