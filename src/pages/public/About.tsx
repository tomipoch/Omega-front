import Omega1 from '../../assets/Omega.jpeg';
import Omega2 from '../../assets/Omega 2.jpg';
import logo from '../../assets/Logo.svg';

const About = () => (
  <section className="container mx-auto py-12 font-ibm">
    <header className="mb-12 text-center">
      <h1 className="text-5xl font-semibold text-center mb-10 mt-10 text-gray-800">Quiénes Somos</h1>
      <p className="text-xl mt-4 text-gray-600">Una tradición de calidad y excelencia desde 1948</p>
    </header>

    <article className="space-y-12">
      <section className="flex flex-col lg:flex-row items-center gap-8">
        <div className="lg:w-1/2">
          <h2 className="text-4xl font-semibold mb-4 text-gray-800">Nuestra Historia</h2>
          <p className="text-lg leading-8 text-gray-600">
            Desde su fundación el 13 de septiembre de 1948, Relojería y Joyería Omega ha sido un
            referente en Talca. Bajo la dirección de Don Luis González Vázquez (Q. E. P. D.), el
            negocio destacó desde sus inicios por su atención cálida y personalizada, convirtiéndose
            en un ícono local.
          </p>
          <p className="text-lg leading-8 text-gray-600 mt-4">
            Hoy, su hijo Luis Eduardo González Azócar y su esposa Patricia Chamorro Muñoz continúan
            el legado familiar, adaptándose a los tiempos sin perder la esencia y valores que
            siempre han caracterizado a la joyería.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img
            src={Omega1}
            alt="Fundador Don Luis González Vázquez"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-lg shadow-lg hover:shadow-2xl transition duration-300"
          />
        </div>
      </section>

      <section className="flex flex-col lg:flex-row-reverse items-center gap-8">
        <div className="lg:w-1/2">
          <h2 className="text-4xl font-semibold mb-4 text-gray-800">Nuestra Ubicación y Resiliencia</h2>
          <p className="text-lg leading-8 text-gray-600">
            Desde su histórica ubicación en 1 Sur N°1634, conocida como &ldquo;Donde canta el
            pajarito&rdquo;, la joyería enfrentó los retos del terremoto del 27 de febrero de
            2010. Este evento marcó un hito, llevándonos a trasladarnos a nuestra ubicación actual
            en 1 Sur N°1610.
          </p>
          <p className="text-lg leading-8 text-gray-600 mt-4">
            Este cambio nos permitió renovarnos y reforzar nuestro compromiso con la calidad y la
            comunidad. Nuestro nuevo hogar refleja nuestra capacidad de adaptarnos y seguir adelante
            con la misma dedicación.
          </p>
        </div>
        <div className="lg:w-1/2">
          <img
            src={Omega2}
            alt="Local Actual en 1 Sur N°1610"
            loading="lazy"
            decoding="async"
            className="rounded-lg shadow-lg hover:shadow-2xl transition duration-300"
          />
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-semibold mb-6 text-center text-gray-800">
          Nuestro Compromiso Contigo
        </h2>
        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="Logo de Relojería y Joyería Omega"
            loading="lazy"
            decoding="async"
            className="w-56 h-auto object-cover"
          />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg leading-8 text-gray-600">
            Cada día abrimos nuestras puertas con la misión de ofrecer más que productos: ofrecemos
            recuerdos, experiencias y emociones. Estamos aquí para acompañarte en cada paso,
            ayudándote a encontrar esa pieza especial que hará tus momentos aún más memorables.
          </p>
          <p className="text-lg leading-8 text-gray-600 mt-4">
            Te invitamos a visitarnos en nuestro local en 1 Sur N°1610 y ser parte de esta
            tradición que ha marcado a Talca por más de siete décadas.
          </p>
        </div>
      </section>
    </article>
  </section>
);

export default About;