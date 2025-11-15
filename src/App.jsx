import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./services/authContext";
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes comunes
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./services/ProtectedRoute";
import ChatBot from "./components/ChatBot";

// Páginas principales
import Home from "./pages/Comun/Home";
import About from "./pages/Comun/About";
import FAQ from "./pages/Comun/Faq";
import NotFoundPage from "./pages/Comun/404";
import SolicitudPersonalizacion from "./pages/Usuario/SolicitudPersonalizacion";
import Catalogo from "./pages/Comun/Catalogo";

// Páginas de autenticación
import Login from "./pages/Usuario/Login";
import Register from "./pages/Usuario/Register";
import Solicitud from "./pages/Usuario/Solicitud";
import Restablecer from "./pages/Usuario/Restablecer";
import Profile from "./pages/Usuario/UserProfile";
import ManageTestimonials from "./pages/Usuario/ManageTestimonials";
import FormTestimonials from "./pages/Usuario/FormTestimonials";
import ManageEvents from "./pages/Usuario/ManageEvents";
import ManageCitasNew from "./pages/Usuario/ManageCitasNew";

// Páginas del blog
import Blog from "./pages/Comun/Blog";
import ArticleDetail from "./pages/Comun/ArticleDetail";

// Administración
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ArticleForm from "./pages/Admin/ArticleForm";
import ManageArticles from "./pages/Admin/ManageArticles";
import ManageReseñas from "./pages/Admin/ManageReseñas";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageDisponibilidad from "./pages/Admin/ManageDisponibilidad";
import ManageServicios from "./pages/Admin/ManageServicios";
import ProductosAdmin from './pages/Admin/ProductosAdmin';
import KpiPanel from './pages/Admin/kpiPanel'; // asegúrate de la ruta correcta



// Layout general
function Layout({ children }) {
  const location = useLocation();

  const hideHeaderFooter = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-grow ${!hideHeaderFooter ? "pt-20" : ""}`}>
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
      {/* ChatBot flotante disponible en todas las páginas */}
      <ChatBot />
    </div>
  );
}

// Configuración principal de rutas
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover
            theme="ligth"
            transition={Bounce}
            style={{ top: '80px', right: '20px' }} 
            />
          <Routes>
            {/* Rutas públicas */}
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
            {/* Rutas protegidas para usuarios autenticados */}
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
            <Route
              path="/testimonials"
              element={<ManageTestimonials />}
            />
            <Route
              path="/testimonials/new"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <FormTestimonials />
                </ProtectedRoute>
              }
            />

            {/* Rutas para administradores */}
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
              path="/admin/disponibilidad"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageDisponibilidad />
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
            path="/admin/productos"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ProductosAdmin />
              </ProtectedRoute>
              }
            />

            <Route
            path="/admin/kpi"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <KpiPanel />
              </ProtectedRoute>
            }
            />


            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
