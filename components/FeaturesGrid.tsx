import { coreModules } from "app/data";
import { motion } from "framer-motion";

export const FeaturesGrid: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8"
  >
  {coreModules.map((mod: { id: string; title: string; subtitle: string; icon: React.ElementType; features: string[]; cta: string }) => (
      <motion.div
        key={mod.id}
        whileHover={{ scale: 1.04 }}
        className="bg-white rounded-xl shadow p-6 text-center border border-blue-100"
      >
        <mod.icon className="w-10 h-10 mx-auto text-blue-600 mb-4" />
        <h3 className="text-xl font-bold text-blue-700 mb-2">{mod.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{mod.subtitle}</p>
        <ul className="text-left text-gray-600 mb-4 space-y-1">
          {mod.features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
              {f}
            </li>
          ))}
        </ul>
        <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition">{mod.cta}</button>
      </motion.div>
    ))}
  </motion.section>
);
