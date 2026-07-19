import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { ROUTES } from '../constants/routes';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MobileMenu = ({ isMobileMenuOpen, closeMobileMenu }: MobileMenuProps) => {
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);
  const [isOtrosOpen, setIsOtrosOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeMenuRef = useRef(closeMobileMenu);
  closeMenuRef.current = closeMobileMenu;

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const menu = menuRef.current;
      const first = menu?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0];
      first?.focus();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenuRef.current();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenuRef.current();
        previousFocusRef.current?.focus?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const menu = menuRef.current;
      if (!menu) return;
      const focusables = Array.from(
        menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    focusFirst();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleClose = () => {
    closeMobileMenu();
    previousFocusRef.current?.focus?.();
  };

  const handleToggleDropdown = (dropdown: 'servicios' | 'otros') => {
    if (dropdown === 'servicios') {
      setIsServiciosOpen((prev) => !prev);
      setIsOtrosOpen(false);
    } else {
      setIsOtrosOpen((prev) => !prev);
      setIsServiciosOpen(false);
    }
  };

  if (!isMobileMenuOpen) return null;

  return (
    <div
      ref={menuRef}
      className="md:hidden absolute top-16 left-0 right-0 bg-white z-20 shadow-lg rounded-b-2xl font-playfair"
      role="dialog"
      aria-modal="true"
      aria-label="Menú móvil"
    >
      <nav className="flex flex-col space-y-2 py-4 text-center border-b-2 border-gray-200">
        <Link
          to={ROUTES.HOME}
          className="text-sgreen hover:bg-gray-200 py-2 rounded transition"
          onClick={handleClose}
        >
          Inicio
        </Link>
        <Link
          to={ROUTES.APPOINTMENTS}
          className="text-sgreen hover:bg-gray-200 py-2 rounded transition"
          onClick={handleClose}
        >
          Citas
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => handleToggleDropdown('servicios')}
            aria-expanded={isServiciosOpen}
            aria-controls="mobile-servicios-menu"
            className="flex justify-center items-center space-x-1 text-sgreen w-full py-2 hover:bg-gray-200 transition"
          >
            <span>Servicios</span>
            <FaAngleDown
              className={`${isServiciosOpen ? 'rotate-180' : ''} transition-transform`}
              aria-hidden="true"
            />
          </button>
          {isServiciosOpen && (
            <ul
              id="mobile-servicios-menu"
              className="flex flex-col bg-gray-100 border-t border-gray-300 space-y-1"
            >
              <li>
                <Link
                  to={ROUTES.CUSTOM_REQUEST}
                  className="text-sgreen py-2 px-4 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  Personalización
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.EVENTS}
                  className="text-sgreen py-2 px-4 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  Eventos
                </Link>
              </li>
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => handleToggleDropdown('otros')}
            aria-expanded={isOtrosOpen}
            aria-controls="mobile-otros-menu"
            className="flex justify-center items-center space-x-1 text-sgreen w-full py-2 hover:bg-gray-200 transition"
          >
            <span>Otros</span>
            <FaAngleDown
              className={`${isOtrosOpen ? 'rotate-180' : ''} transition-transform`}
              aria-hidden="true"
            />
          </button>
          {isOtrosOpen && (
            <ul
              id="mobile-otros-menu"
              className="flex flex-col bg-gray-100 border-t border-gray-300 space-y-1"
            >
              <li>
                <Link
                  to={ROUTES.TESTIMONIALS}
                  className="text-sgreen py-2 px-4 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  Reseñas
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.FAQ}
                  className="text-sgreen py-2 px-4 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.BLOG}
                  className="text-sgreen py-2 px-4 hover:bg-gray-200 transition"
                  onClick={handleClose}
                >
                  Blog
                </Link>
              </li>
            </ul>
          )}
        </div>

        <Link
          to={ROUTES.ABOUT}
          className="text-sgreen hover:bg-gray-200 py-2 rounded transition"
          onClick={handleClose}
        >
          Quiénes Somos
        </Link>
      </nav>
    </div>
  );
};

export default MobileMenu;