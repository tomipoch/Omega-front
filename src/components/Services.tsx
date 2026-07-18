import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Relojes from '../assets/Relojes.svg';
import Joyas from '../assets/Joyas.svg';
import Reparacion from '../assets/Reparacion.svg';

interface ServiceItemProps {
  image: string;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}

const ServicioItem = ({ image, title, description, delay, inView }: ServiceItemProps) => (
  <motion.div
    className="flex flex-col items-center text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
  >
    <motion.img
      src={image}
      alt={title}
      className="w-72 h-72 mb-4 object-cover rounded-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 120 }}
    />
    <h4 className="text-2xl font-semibold mb-2">{title}</h4>
    <p className="text-base max-w-xs">{description}</p>
  </motion.div>
);

const ServiciosSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="flex flex-col font-ibm items-center justify-center py-16 px-8 mt-60 min-h-screen bg-white text-black text-center"
    >
      <motion.h3
        className="text-5xl font-bold mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Servicios exclusivos para Ti
      </motion.h3>

      <motion.p
        className="text-lg max-w-xl mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        Ofrecemos una amplia gama de servicios personalizados para satisfacer tus necesidades...
      </motion.p>

      <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
        <ServicioItem
          image={Relojes}
          title="Venta de Relojes y Joyas"
          description="Descubre nuestra colección de relojes y joyas únicas y elegantes para todas las ocasiones."
          delay={0.5}
          inView={inView}
        />
        <ServicioItem
          image={Joyas}
          title="Personalización de Joyas"
          description="Crea joyas únicas que reflejen tu estilo y personalidad."
          delay={0.7}
          inView={inView}
        />
        <ServicioItem
          image={Reparacion}
          title="Reparación de Relojes"
          description="Reparamos tus relojes favoritos para que vuelvan a funcionar como nuevos."
          delay={0.9}
          inView={inView}
        />
      </div>
    </section>
  );
};

export default ServiciosSection;