import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Target, Users, Heart, GraduationCap, Zap, Shield } from 'lucide-react';

const manifestoPoints = [
  { icon: Target, title: 'Infrastructure Development', desc: 'Modern roads, rural electrification, and clean water for every community.' },
  { icon: Users, title: 'Youth Empowerment', desc: 'Skills training, entrepreneurship grants, and job creation programmes.' },
  { icon: Heart, title: 'Healthcare for All', desc: 'Upgraded primary health centres and affordable health insurance.' },
  { icon: GraduationCap, title: 'Quality Education', desc: 'Renovated schools, teacher training, and scholarships.' },
  { icon: Zap, title: 'Economic Growth', desc: 'Support for small businesses, agriculture, and market access.' },
  { icon: Shield, title: 'Security & Justice', desc: 'Community policing and quick access to justice.' },
];

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-apc-primary mb-8">Our Manifesto</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl">
          A detailed blueprint for the progress of Nkanu West. These commitments will guide every action
          when elected into the Enugu State House of Assembly.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manifestoPoints.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-apc-primary/10 rounded-lg flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-apc-primary" />
              </div>
              <h3 className="text-xl font-semibold text-apc-primary mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}