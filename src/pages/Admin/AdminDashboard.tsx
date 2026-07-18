import { Link } from 'react-router-dom';
import { Users, Calendar, Star, Briefcase, Tool, FileText } from 'react-feather';

interface AdminCardProps {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
}

const AdminCard = ({ to, title, description, icon, bg, text }: AdminCardProps) => (
  <Link
    to={to}
    className={`col-span-1 row-span-1 rounded-xl ${bg} p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between`}
  >
    <div className={`flex items-center justify-center h-12 w-12 rounded-full ${text} mb-3`}>
      {icon}
    </div>
    <div>
      <h3 className={`text-lg font-semibold ${text} mb-1`}>{title}</h3>
      <p className={`text-xs ${text}`}>{description}</p>
    </div>
  </Link>
);

const AdminDashboard = () => (
  <div className="max-w-6xl font-ibm mx-auto px-6 py-8 mt-10 ">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel de Administración</h1>
    <p className="text-gray-600 text-base mb-6">
      Bienvenido al panel de administración. Desde aquí puedes gestionar los diferentes aspectos del
      sistema.
    </p>

    <div className="h-full w-full flex items-center justify-center">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-3 p-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        <AdminCard
          to="/admin/users"
          title="Usuarios"
          description="Gestiona todos los usuarios registrados."
          icon={<Users className="h-6 w-6" />}
          bg="bg-blue-100"
          text="text-blue-700"
        />
        <AdminCard
          to="/admin/blog"
          title="Artículos"
          description="Crear, editar o eliminar artículos del blog."
          icon={<FileText className="h-6 w-6" />}
          bg="bg-indigo-100"
          text="text-indigo-700"
        />
        <AdminCard
          to="/admin/disponibilidad"
          title="Disponibilidades"
          description="Gestiona los horarios disponibles para citas."
          icon={<Calendar className="h-6 w-6" />}
          bg="bg-green-100"
          text="text-green-700"
        />
        <AdminCard
          to="/admin/reviews"
          title="Reseñas"
          description="Responde a las reseñas de los usuarios."
          icon={<Star className="h-6 w-6" />}
          bg="bg-yellow-100"
          text="text-yellow-700"
        />
        <AdminCard
          to="/admin/events"
          title="Eventos"
          description="Administra eventos y talleres del sistema."
          icon={<Briefcase className="h-6 w-6" />}
          bg="bg-purple-100"
          text="text-purple-700"
        />
        <AdminCard
          to="/admin/servicios"
          title="Servicios"
          description="Gestiona los servicios de joyería y relojería."
          icon={<Tool className="h-6 w-6" />}
          bg="bg-red-100"
          text="text-red-700"
        />
        <AdminCard
          to="/admin/productos"
          title="Productos"
          description="Administra el stock y la información de productos."
          icon={<Briefcase className="h-6 w-6" />}
          bg="bg-pink-100"
          text="text-pink-700"
        />
      </div>
    </div>
  </div>
);

export default AdminDashboard;