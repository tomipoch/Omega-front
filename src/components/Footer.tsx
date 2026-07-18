import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-sgreen text-white py-10 font-ibm">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <section aria-labelledby="social-media" className="flex flex-col items-center md:items-start">
          <img src="/vite.svg" alt="Logotipo de OMEGA" className="w-40 h-auto mb-6" />
          <address className="flex space-x-6 justify-center md:justify-start not-italic">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={40} className="hover:text-bgreen transition-colors duration-300" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={40} className="hover:text-bgreen transition-colors duration-300" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={40} className="hover:text-bgreen transition-colors duration-300" />
            </a>
          </address>
        </section>

        <nav aria-labelledby="footer-navigation" className="hidden md:block">
          <h3 id="footer-navigation" className="font-semibold mb-4">Navegar</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:underline">Inicio</Link></li>
            <li><Link to="/citas" className="hover:underline">Citas</Link></li>
            <li><Link to="/solicitud-personalizacion" className="hover:underline">Personalización</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            <li><Link to="/about" className="hover:underline">Quiénes Somos</Link></li>
          </ul>
        </nav>

        <section aria-labelledby="subscription">
          <h3 id="subscription" className="font-semibold mb-4">Suscribirse</h3>
          <p className="mb-4">
            Únete a nuestro boletín para estar al día de las novedades y lanzamientos.
          </p>
          <form
            className="flex flex-col sm:flex-row items-center sm:items-start"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Tu correo electrónico"
              className="p-2 rounded-xl border-none text-gray-900 mb-4 sm:mb-0 sm:mr-4 w-full sm:w-auto"
            />
            <button
              type="submit"
              className="bg-sgreen text-white py-2 px-6 border-2 border-white rounded-2xl shadow-inner-green hover:scale-105 transition duration-300 ease-in-out"
            >
              Suscribirse
            </button>
          </form>
          <p className="text-xs mt-2">
            Al suscribirte, aceptas nuestra{' '}
            <Link to="/" className="hover:underline">Política de Privacidad</Link>.
          </p>
        </section>
      </div>

      <div className="mt-8 border-t border-white pt-4 flex flex-col md:flex-row justify-between items-center">
        <p>© 2024 Todos los derechos reservados</p>
        <nav
          aria-label="Enlaces legales"
          className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4 mt-4 md:mt-0"
        >
          <Link to="/" className="hover:underline">Política de Privacidad</Link>
          <Link to="/" className="hover:underline">Términos de Servicio</Link>
          <Link to="/" className="hover:underline">Configuración de Cookies</Link>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;