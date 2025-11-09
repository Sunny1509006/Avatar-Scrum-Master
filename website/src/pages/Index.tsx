import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LiveKitWidget from "@/components/ai_avatar/LiveKitWidget";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Dumbbell,
  Crown,
  Calendar,
  Users,
  Star,
  ArrowRight,
  ChefHat,
  Coffee,
  MessageCircle
} from "lucide-react";

// Import images
import heroImage from "@/assets/hero-hotel.jpg";
import suiteImage from "@/assets/suite-room.jpg";
import diningImage from "@/assets/dining-restaurant.jpg";
import meetingImage from "@/assets/meeting-room.jpg";
import spaImage from "@/assets/spa-amenities.jpg";
import loungeImage from "@/assets/lounge-area.jpg";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Scrum Master Hub
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "home", label: "Home" },
                { id: "services", label: "Services" },
                { id: "resources", label: "Resources" },
                { id: "workshops", label: "Workshops" },
                { id: "events", label: "Certifications & Events" },
                { id: "contact", label: "Contact" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    activeSection === item.id ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button variant="luxury" size="sm" onClick={() => navigate('/booking')}>Book Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className={`relative z-10 text-center text-white px-6 max-w-4xl mx-auto ${
          isVisible ? "animate-fade-in" : "opacity-0"
        }`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Lead Agile Teams
            <span className="block bg-gradient-gold bg-clip-text text-transparent">
              With Confidence
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Coaching, training, and tools for Scrum success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={() => scrollToSection("services")}>
              Explore Services <ArrowRight className="ml-2" />
            </Button>
            <Button variant="luxury" size="xl">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practical offerings to elevate your team's agility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Agile Coaching",
                price: "Popular",
                image: suiteImage,
                features: ["Team assessments", "Sprint facilitation", "Backlog refinement", "Continuous improvement"]
              },
              {
                title: "Scrum Training",
                price: "Core",
                image: loungeImage,
                features: ["Fundamentals", "Practical exercises", "Real-world examples", "Certification prep"]
              },
              {
                title: "Enterprise Transformation",
                price: "Enterprise",
                image: suiteImage,
                features: ["Scaling frameworks", "Leadership coaching", "Value stream mapping", "Roadmap & OKRs"]
              }
            ].map((room, index) => (
              <Card key={index} className="overflow-hidden shadow-luxury hover:shadow-hover transition-all duration-300 animate-scale-in group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {room.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{room.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-muted-foreground">
                        <Star className="h-4 w-4 text-accent mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="elegant" className="w-full" onClick={() => navigate('/booking')}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Resources</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Toolkits, templates, and best practices for Scrum Masters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              {[
                { icon: Users, title: "Community", desc: "Join discussions with Scrum Masters worldwide", link: null },
                { icon: Calendar, title: "Events", desc: "Upcoming webinars and meetups", link: null },
                { icon: Star, title: "Best Practices", desc: "Curated guidance for common challenges", link: null },
                { icon: MessageCircle, title: "Templates", desc: "Retro, planning, and refinement templates", link: null }
              ].map((amenity, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-4 ${amenity.link ? 'cursor-pointer hover:bg-muted/50 p-4 rounded-lg transition-colors' : 'p-4'}`}
                  onClick={() => amenity.link && navigate(amenity.link)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                    <amenity.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                    <p className="text-muted-foreground">{amenity.desc}</p>
                    {amenity.link && (
                      <p className="text-sm text-primary mt-2 hover:underline">Learn more →</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="animate-scale-in">
              <img 
                src={spaImage} 
                alt="Resources"
                className="w-full h-96 object-cover rounded-lg shadow-luxury"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workshops */}
      <section id="workshops" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Workshops</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hands-on training for Scrum Masters and agile teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="overflow-hidden shadow-luxury animate-scale-in">
              <div className="relative h-64">
                <img 
                  src={diningImage} 
                  alt="Facilitation Masterclass"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <ChefHat className="h-5 w-5 text-accent mr-2" />
                  <h3 className="text-2xl font-bold">Facilitation Masterclass</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Learn advanced facilitation techniques to run effective ceremonies and workshops
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration: 4 hours</span>
                  <Button variant="luxury" size="sm">Enroll Now</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-luxury animate-scale-in">
              <div className="relative h-64">
                <img 
                  src={loungeImage} 
                  alt="Sprint Planning Deep Dive"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Coffee className="h-5 w-5 text-accent mr-2" />
                  <h3 className="text-2xl font-bold">Sprint Planning Deep Dive</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Master backlog prioritization and sprint goal alignment with practical exercises
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration: 3 hours</span>
                  <Button variant="elegant" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Certifications & Events */}
      <section id="events" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Certifications & Events</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Grow your credentials and connect with the agile community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "PSM I Bootcamp",
                capacity: "2 days",
                image: meetingImage,
                features: ["Core Scrum theory", "Practice exams", "Certification tips"]
              },
              {
                title: "Agile Leadership Summit",
                capacity: "300 attendees",
                image: meetingImage,
                features: ["Keynotes", "Panel discussions", "Networking sessions"]
              },
              {
                title: "Scrum@Scale Workshop",
                capacity: "1 day",
                image: loungeImage,
                features: ["Scaling practices", "Case studies", "Team exercises"]
              }
            ].map((venue, index) => (
              <Card key={index} className="overflow-hidden shadow-luxury hover:shadow-hover transition-all duration-300 animate-scale-in">
                <div className="relative h-48">
                  <img 
                    src={venue.image} 
                    alt={venue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{venue.title}</h3>
                    <div className="flex items-center text-accent">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.capacity}</span>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-6 text-sm text-muted-foreground">
                    {venue.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                  <Button variant="elegant" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Register Interest
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help you succeed with Scrum
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 animate-slide-in-left">
              <div>
                <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">123 Agile Way, Downtown District</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">support@scrummasterhub.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-luxury animate-scale-in">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                  <Input placeholder="Email Address" type="email" />
                  <Input placeholder="Phone Number" type="tel" />
                  <Textarea placeholder="How can we assist you?" rows={4} />
                  <Button variant="luxury" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">
                Scrum Master Hub
              </h3>
              <p className="text-primary-foreground/80">
                Coaching, training, and resources for effective Scrum leadership.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#services" className="hover:text-accent transition-colors">Services</a></li>
                <li><a href="#resources" className="hover:text-accent transition-colors">Resources</a></li>
                <li><a href="#workshops" className="hover:text-accent transition-colors">Workshops</a></li>
                <li><a href="#events" className="hover:text-accent transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Agile Coaching</li>
                <li>Scrum Training</li>
                <li>Workshops</li>
                <li>Consulting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <p>123 Agile Way</p>
                <p>+1 (555) 123-4567</p>
                <p>info@scrummasterhub.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 Scrum Master Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Concierge Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          variant="luxury" 
          size="lg"
          className="rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-3"
          onClick={() => setShowSupport(true)}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Talk to AI Coach</span>
        </Button>
      </div>
      {/* LiveKit Widget */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
          <div className="pointer-events-auto">
            <LiveKitWidget setShowSupport={setShowSupport} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Index;