import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Users, Dumbbell, Baby, Stethoscope } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  features: string[];
  recommended?: boolean;
}

const services: Service[] = [
  {
    id: "mental-health",
    title: "Mental Health & Wellness",
    description: "Support for stress, anxiety, depression and emotional wellness",
    icon: <Brain className="w-6 h-6" />,
    category: "Mental Health",
    features: ["Individual therapy", "Group sessions", "Wellness coaching", "24/7 support"],
    recommended: true
  },
  {
    id: "physical-therapy",
    title: "Physical Therapy & Rehabilitation",
    description: "Treatment for joint, bone, muscle pain and injury recovery",
    icon: <Dumbbell className="w-6 h-6" />,
    category: "Physical Health",
    features: ["Movement assessment", "Pain management", "Injury prevention", "Custom exercises"]
  },
  {
    id: "cardiovascular",
    title: "Cardiovascular Health",
    description: "Heart and lung health support and rehabilitation programs",
    icon: <Heart className="w-6 h-6" />,
    category: "Cardiovascular",
    features: ["Heart health screening", "Exercise programs", "Nutrition guidance", "Risk assessment"]
  },
  {
    id: "child-development",
    title: "Child Development Services",
    description: "Support for children's development, learning and behavioral needs",
    icon: <Baby className="w-6 h-6" />,
    category: "Pediatric",
    features: ["Developmental assessments", "Learning support", "Behavioral therapy", "Family counseling"]
  },
  {
    id: "telehealth",
    title: "Telehealth Services",
    description: "Remote consultations and virtual therapy sessions",
    icon: <Stethoscope className="w-6 h-6" />,
    category: "Remote Care",
    features: ["Video consultations", "Remote monitoring", "Digital therapy", "Online assessments"]
  },
  {
    id: "group-programs",
    title: "Group Programs",
    description: "Community-based wellness and support programs",
    icon: <Users className="w-6 h-6" />,
    category: "Community",
    features: ["Support groups", "Wellness workshops", "Fitness classes", "Educational seminars"]
  }
];

export function ServiceSelector() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Care Path</h2>
        <p className="text-lg text-muted-foreground">
          Select the services that best match your health and wellness needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className={`relative transition-all hover:shadow-lg ${
            service.recommended ? 'border-primary shadow-md' : ''
          }`}>
            {service.recommended && (
              <Badge className="absolute -top-2 left-4 bg-primary">
                Recommended
              </Badge>
            )}
            
            <CardHeader>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {service.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{service.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Features:</h4>
                <ul className="text-sm space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2 pt-4">
                <Button className="w-full">
                  Learn More
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="p-6 bg-muted/50">
          <h3 className="text-xl font-semibold mb-2">Need Help Choosing?</h3>
          <p className="text-muted-foreground mb-4">
            Take our assessment to get personalized service recommendations
          </p>
          <Button size="lg">
            Start Assessment
          </Button>
        </Card>
      </div>
    </div>
  );
}
