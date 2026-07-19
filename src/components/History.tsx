import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

const TEXT =
  'Desde 1948, Relojería y Joyería Omega de Talca ha ofrecido joyas y relojes de alta calidad, junto con servicios técnicos especializados, convirtiéndonos en un referente de confianza en la región del Maule. Nuestra misión es brindar productos y servicios de joyería y relojería de excelente calidad, con atención personalizada y soluciones integrales que acompañen a nuestros clientes en momentos especiales. En "OMEGA" queremos ser la joyería y relojería líder en la región, reconocida por la calidad, exclusividad y confianza, innovando continuamente para satisfacer a nuestros clientes.';

const splitWords = (text: string): string[] => text.split(' ').filter(Boolean);

const useWordAnimation = (progress: MotionValue<number>) => {
  const opacity = useTransform(progress, [0.2, 0.6], [0, 1]);
  const y = useTransform(progress, [0.2, 0.6], [20, 0]);
  return { opacity, y };
};

const HistoriaSection = () => {
  const historiaRef = useRef<HTMLElement | null>(null);
  const words = useMemo(() => splitWords(TEXT), []);
  const { scrollYProgress } = useScroll({
    target: historiaRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end start'],
  });
  const wordAnimation = useWordAnimation(scrollYProgress);

  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [50, 0]);

  const polaroidOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);
  const polaroidY = useTransform(scrollYProgress, [0.6, 0.7], [50, 0]);
  const polaroidRotate = useTransform(scrollYProgress, [0.6, 0.7], [-5, 0]);

  return (
    <section
      ref={historiaRef}
      className="relative min-h-[300vh] flex items-center justify-center font-ibm px-4 md:px-8 lg:px-16"
      style={{ backgroundColor: '#006B0B' }}
    >
      <div className="absolute top-0 left-0 w-full h-10 bg-[#C1F6C6]" />
      <div className="absolute top-10 left-0 w-full h-10 bg-[#49B854]" />

      <div className="sticky top-0 mt-40 h-screen flex flex-col items-center justify-center space-y-16 md:space-y-32 lg:space-y-64">
        <motion.h3
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-3xl md:text-4xl lg:text-5xl text-left max-w-xl font-bold text-white"
        >
          Nuestra Historia, Misión y Visión
        </motion.h3>

        <motion.p className="text-xl md:text-2xl lg:text-3xl max-w-4xl text-left text-white sticky top-1/4 transform -translate-y-1/5">
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              style={{ opacity: wordAnimation.opacity, y: wordAnimation.y }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          style={{ opacity: polaroidOpacity, y: polaroidY, rotate: polaroidRotate }}
          className="flex justify-center sticky top-1/3 transform -translate-y-1/3"
        >
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <img
              src="/assets/Historia.svg"
              alt="Historia"
              className="w-60 h-auto md:w-80 lg:w-[24rem]"
              loading="lazy"
              decoding="async"
            />
            <p className="text-center text-black text-sm md:text-lg lg:text-xl mt-2">OMEGA año 1948</p>
          </div>
        </motion.div>

        <div className="h-[150vh]" aria-hidden="true" />
      </div>
    </section>
  );
};

export default HistoriaSection;