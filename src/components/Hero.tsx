import { motion } from 'framer-motion';

const HeroSection = () => (
  <section className="flex flex-col font-ibm items-center justify-center text-center py-20 min-h-screen bg-white text-black">
    <motion.h1
      className="text-5xl font-bold max-w-lg mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      Encuentra la <span className="text-gold-effect">Joya</span> perfecta para ti
    </motion.h1>

    <motion.p
      className="text-xl max-w-lg mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
    >
      Descubre nuestra amplia selección de relojes y joyas de alta calidad que se adaptan a tu
      estilo y personalidad.
    </motion.p>

    <motion.img
      src="/assets/Anillos.svg"
      alt="Anillos"
      className="w-72 h-72"
      loading="lazy"
      decoding="async"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.5,
        duration: 0.8,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 120,
      }}
    />
  </section>
);

export default HeroSection;