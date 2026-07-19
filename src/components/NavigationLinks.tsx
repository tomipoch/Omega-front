import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { isAdmin } from '../constants/roles';
import { ROUTES } from '../constants/routes';

const baseLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `hover:text-sgreen transition duration-300${isActive ? ' font-bold text-sgreen' : ''}`;

interface DropdownSectionProps {
  id: string;
  label: string;
  links: Array<{ to: string; label: string }>;
}

const DropdownSection = ({ id, label, links }: DropdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const first = containerRef.current?.querySelector<HTMLAnchorElement>('a[href]');
        first?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex items-center hover:text-sgreen transition duration-300 focus:outline-none focus:ring-2 focus:ring-sgreen rounded"
      >
        {label}
        <FaAngleDown
          className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <ul
        id={id}
        role="menu"
        className={`absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200 min-w-[12rem] z-30 transition ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {links.map((link) => (
          <li key={link.to} role="none">
            <NavLink
              to={link.to}
              role="menuitem"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen focus:outline-none focus:bg-gray-200 focus:text-sgreen"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NavigationLinks = () => {
  const { user } = useUser();
  const homeRoute = isAdmin(user?.rol_id) ? ROUTES.ADMIN : ROUTES.HOME;

  return (
    <>
      <NavLink to={homeRoute} className={baseLinkClass}>
        Inicio
      </NavLink>
      <NavLink to={ROUTES.APPOINTMENTS} className={baseLinkClass}>
        Citas
      </NavLink>
      <NavLink to={ROUTES.CATALOG} className={baseLinkClass}>
        Catálogo
      </NavLink>

      <DropdownSection
        id="nav-servicios"
        label="Servicios"
        links={[
          { to: ROUTES.CUSTOM_REQUEST, label: 'Personalización' },
          { to: ROUTES.EVENTS, label: 'Eventos' },
        ]}
      />

      <DropdownSection
        id="nav-otros"
        label="Otros"
        links={[
          { to: ROUTES.TESTIMONIALS, label: 'Reseñas' },
          { to: ROUTES.FAQ, label: 'FAQ' },
          { to: ROUTES.BLOG, label: 'Blog' },
        ]}
      />

      <NavLink to={ROUTES.ABOUT} className={`${baseLinkClass} whitespace-nowrap`}>
        Quiénes Somos
      </NavLink>
    </>
  );
};

export default NavigationLinks;