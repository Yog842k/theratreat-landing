'use client'
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Mail, Phone, MapPin, Users, Heart, Building } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    iconColor: "text-blue-600",
    title: "Email Us",
    details: ["support@theratreat.in", "Available 24/7"]
  },
  {
    icon: Phone,
    iconColor: "text-green-600",
    title: "Phone/WhatsApp",
    details: ["+91 8446602680", "Mon-Sat 9AM-6PM IST"]
  },
  {
    icon: MapPin,
    iconColor: "text-purple-600",
    title: "Visit Us",
    details: [
      "TheraTreat Technologies Private Limited",
      "1503/2, Jadhav Nagar, Shikrapur, Shirur, Pune 412208, Maharashtra"
    ]
  }
];

const specificContacts = [
  {
    icon: Users,
    title: "Patients",
    email: "help@theratreat.in",
    color: "blue"
  },
  {
    icon: Heart,
    title: "Therapists & Clinics",
    email: "info@theratreat.in",
    color: "green"
  },
  {
    icon: Building,
    title: "Business/Media",
    email: "connect@theratreat.in",
    color: "purple"
  }
];

export function ContactSection() {
  return (
    <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16 px-6 rounded-2xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">📩 Contact Us</h2>
          <p className="text-xl text-muted-foreground">
            We're here to help you! Whether you're a patient, therapist, clinic, or partner—our team is always ready to connect.
          </p>
        </div>

        {/* Main Contact Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <contact.icon className={`w-12 h-12 ${contact.iconColor} mx-auto mb-4`} />
                  <h3 className="text-xl font-semibold mb-3">{contact.title}</h3>
                  {contact.details.map((detail, idx) => (
                    <p key={idx} className="text-muted-foreground">{detail}</p>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Specific Queries */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-center text-blue-600">For Specific Queries:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {specificContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className={contact.color === "blue" ? "text-center border-2 border-blue-200 hover:border-blue-300 transition-all duration-300" : 
                  contact.color === "green" ? "text-center border-2 border-green-200 hover:border-green-300 transition-all duration-300" :
                  "text-center border-2 border-purple-200 hover:border-purple-300 transition-all duration-300"}>
                  <CardContent className="pt-6">
                    <contact.icon className={contact.color === "blue" ? "w-8 h-8 text-blue-600 mx-auto mb-3" : 
                      contact.color === "green" ? "w-8 h-8 text-green-600 mx-auto mb-3" :
                      "w-8 h-8 text-purple-600 mx-auto mb-3"} />
                    <h4 className="font-semibold mb-2">{contact.title}</h4>
                    <p className={contact.color === "blue" ? "text-blue-600 font-medium" : 
                      contact.color === "green" ? "text-green-600 font-medium" :
                      "text-purple-600 font-medium"}>{contact.email}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}