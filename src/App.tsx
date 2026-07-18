import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from './services/authContext';

// Componentes comunes
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './services/ProtectedRoute';

// Páginas comunes
import Home from './pages/Comun/Home';
import About from './pages/Comun/About';
import FAQ from './pages/Comun/Faq';
import NotFoundPage from './pages/Comun/404';
import Catalogo from './pages/Comun/Catalogo';
import Blog from './pages/Comun/Blog';
import ArticleDetail from './pages/Comun/ArticleDetail';

// Autenticación y usuario
import Login from './pages/Usuario/Login';
import Register from './pages/Usuario/Register';
import Solicitud from './pages/Usuario/Solicitud';
import Restablecer from './pages/Usuario/Restablecer';
import Profile from './pages/Usuario/UserProfile';
import ManageTestimonials from './pages/Usuario/ManageTestimonials';
import FormTestimonials from './pages/Usuario/FormTestimonials';
import ManageEvents from './pages/Usuario/ManageEvents';
import ManageCitasNew from './pages/Usuario/ManageCitasNew';
import SolicitudPersonalizacion from './pages/Usuario/SolicitudPersonalizacion';

// Administración
import AdminDashboard from './pages/Admin/AdminDashboard';
import ArticleForm from './pages/Admin/ArticleForm';
import ManageArticles from './pages/Admin/ManageArticles';
import ManageReseñas from './pages/Admin/ManageReseñas';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageDisponibilidad from './pages/Admin/ManageDisponibilidad';
import ManageServicios from './pages/Admin/ManageServicios';
import ManageCitasAdmin from './pages/Admin/ManageCitasAdmin';
import ManageEventsAdmin from './pages/Admin/ManageEventsAdmin';
import EventForm from './pages/Admin/EventForm';
import ProductosAdmin from './pages/Admin/ProductosAdmin';

const HIDE_CHROME_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Solicitud />} />
            <Route path="/reset-password" element={<Restablecer />} />
            <Route path="/catalogo" element={<Catalogo />} />

            {/* Autenticadas (usuario o admin) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ManageCitasNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ManageEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/solicitud-personalizacion"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <SolicitudPersonalizacion />
                </ProtectedRoute>
              }
            />
            <Route path="/testimonials" element={<ManageTestimonials />} />
            <Route
              path="/testimonials/new"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <FormTestimonials />
                </ProtectedRoute>
              }
            />

            {/* Solo administradores */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageReseñas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/servicios"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageServicios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageArticles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/new"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageEventsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/new"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageCitasAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disponibilidad"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageDisponibilidad />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ProductosAdmin />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;