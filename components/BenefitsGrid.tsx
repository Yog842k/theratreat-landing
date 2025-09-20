import { platformBenefits } from "../app/data";
import { motion } from "framer-motion";

export const BenefitsGrid: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8"
  >
  {platformBenefits.map((benefit: { id: string; title: string; description: string; icon: React.ElementType }, i: number) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.04 }}
        className="bg-white rounded-xl shadow p-6 text-center border border-blue-100"
      >
        <benefit.icon className="w-10 h-10 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-bold text-blue-700 mb-2">{benefit.title}</h3>
        <p className="text-gray-600 text-sm">{benefit.description}</p>
      </motion.div>
    ))}
  </motion.section>
);
