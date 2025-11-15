import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import { AuthContext } from "../services/authContext";

const NavigationLinks = React.memo(() => {
  const { user } = useContext(AuthContext);
  const [homeRoute, setHomeRoute] = useState("/");

  useEffect(() => {
    // Cambia la ruta de inicio según el rol del usuario
    if (user?.rol_id === 2) {
      setHomeRoute("/admin"); // Ruta para admin
    } else {
      setHomeRoute("/"); // Ruta para usuarios normales
    }
  }, [user]);

  const [openDropdown, setOpenDropdown] = useState(null);

  const closeMenus = () => setOpenDropdown(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <nav
      aria-label="Primary Navigation"
      className="flex space-x-4 text-gray-700"
    >
      {/* Enlace Inicio dinámico */}
      <NavLink
        to={homeRoute}
        className={({ isActive }) =>
          `hover:text-sgreen transition duration-300${isActive ? " font-bold text-sgreen" : ""}`
        }
      >
        Inicio
      </NavLink>

      {/* Enlace Citas */}
      <NavLink
        to="/citas"
        className={({ isActive }) =>
          `hover:text-sgreen transition duration-300${isActive ? " font-bold text-sgreen" : ""}`
        }
      >
        Citas
      </NavLink>

      {/* Enlace directo al Catálogo */}
      <NavLink
        to="/catalogo"
        className={({ isActive }) =>
          `hover:text-sgreen transition duration-300${isActive ? " font-bold text-sgreen" : ""}`
        }
      >
        Catálogo
      </NavLink>
      
      {/* Menú desplegable Servicios */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("servicios")}
          className="flex items-center hover:text-sgreen transition duration-300"
          aria-haspopup="menu"
          aria-expanded={openDropdown === "servicios"}
        >
          Servicios{" "}
          <FaAngleDown
            className={`ml-1 ${
              openDropdown === "servicios" ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === "servicios" && (
          <ul
            className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200"
            role="menu"
          >
            <li>
              <NavLink
                to="/solicitud-personalizacion"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
                onClick={closeMenus}
              >
                Personalización
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
                onClick={closeMenus}
              >
                Eventos
              </NavLink>
            </li>
          </ul>
        )}
      </div>

      {/* Menú desplegable Otros */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("otros")}
          className="flex items-center hover:text-sgreen transition duration-300"
          aria-haspopup="menu"
          aria-expanded={openDropdown === "otros"}
        >
          Otros{" "}
          <FaAngleDown
            className={`ml-1 ${openDropdown === "otros" ? "rotate-180" : ""}`}
          />
        </button>
        {openDropdown === "otros" && (
          <ul
            className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200"
            role="menu"
          >
            <li>
              <NavLink
                to="/testimonials"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
                onClick={closeMenus}
              >
                Reseñas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/faq"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
                onClick={closeMenus}
              >
                FAQ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/blog"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-sgreen"
                onClick={closeMenus}
              >
                Blog
              </NavLink>
            </li>
          </ul>
        )}
      </div>

      {/* Enlace Quiénes Somos */}
      <NavLink
        to="/about"
        className={({ isActive }) =>
          `hover:text-sgreen transition duration-300 whitespace-nowrap${isActive ? " font-bold text-sgreen" : ""}`
        }
      >
        Quiénes Somos
      </NavLink>
    </nav>
  );
});

export default NavigationLinks;
