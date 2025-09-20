import { motion } from "framer-motion";

export const TeamSection: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="py-8"
  >
    <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Meet Our Team</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1,2,3].map((i) => (
        <motion.div key={i} whileHover={{ scale: 1.04 }} className="bg-white rounded-xl shadow p-6 text-center border border-blue-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 mb-4" />
          <h3 className="text-lg font-bold text-blue-700 mb-2">Member {i}</h3>
          <p className="text-gray-600 text-sm">Role {i}</p>
        </motion.div>
      ))}
    </div>
  </motion.section>
);
