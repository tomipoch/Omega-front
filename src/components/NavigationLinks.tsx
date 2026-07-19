import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { isAdmin } from '../constants/roles';
import { ROUTES } from '../constants/routes';

const baseLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `hover:text-sgreen transition duration-300${isActive ? ' font-bold text-sgreen' : ''}`;

const NavigationLinks = () => {
  const { user } = useUser();
  const homeRoute = useMemo(
    () => (isAdmin(user?.rol_id) ? ROUTES.ADMIN : ROUTES.HOME),
    [user],
  );

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
              to={ROUTES.CUSTOM_REQUEST}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Personalización
            </NavLink>
          </li>
          <li>
            <NavLink
              to={ROUTES.EVENTS}
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
              to={ROUTES.TESTIMONIALS}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Reseñas
            </NavLink>
          </li>
          <li>
            <NavLink
              to={ROUTES.FAQ}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              FAQ
            </NavLink>
          </li>
          <li>
            <NavLink
              to={ROUTES.BLOG}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
              role="menuitem"
            >
              Blog
            </NavLink>
          </li>
        </ul>
      </div>

      <NavLink to={ROUTES.ABOUT} className={`${baseLinkClass} whitespace-nowrap`}>
        Quiénes Somos
      </NavLink>
    </>
  );
};

export default NavigationLinks;