import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { ADMIN_ROL } from '../types';

const baseLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `hover:text-sgreen transition duration-300${isActive ? ' font-bold text-sgreen' : ''}`;

const NavigationLinks = () => {
  const { user } = useUser();
  const homeRoute = useMemo(
    () => (Number(user?.rol_id) === ADMIN_ROL ? '/admin' : '/'),
    [user],
  );

  return (
    <>
      <NavLink to={homeRoute} className={baseLinkClass}>
        Inicio
      </NavLink>
      <NavLink to="/citas" className={baseLinkClass}>
        Citas
      </NavLink>
      <NavLink to="/catalogo" className={baseLinkClass}>
        Catálogo
      </NavLink>

      <div className="relative group">
        <button
          type="button"
          className="flex items-center hover:text-sgreen transition duration-300"
          aria-haspopup="menu"
        >
          Servicios
          <FaAngleDown className="ml-1 transition-transform group-hover:rotate-180" />
        </button>
        <ul
          className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200 min-w-[12rem] z-30"
          role="menu"
        >
          <li>
            <NavLink
              to="/solicitud-personalizacion"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Personalización
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/events"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Eventos
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="relative group">
        <button
          type="button"
          className="flex items-center hover:text-sgreen transition duration-300"
          aria-haspopup="menu"
        >
          Otros
          <FaAngleDown className="ml-1 transition-transform group-hover:rotate-180" />
        </button>
        <ul
          className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200 min-w-[12rem] z-30"
          role="menu"
        >
          <li>
            <NavLink
              to="/testimonials"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Reseñas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/faq"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/blog"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Blog
            </NavLink>
          </li>
        </ul>
      </div>

      <NavLink to="/about" className={`${baseLinkClass} whitespace-nowrap`}>
        Quiénes Somos
      </NavLink>
    </>
  );
};

export default NavigationLinks;