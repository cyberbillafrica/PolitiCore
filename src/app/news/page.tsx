import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar } from 'lucide-react';

const newsItems = [
  { id: 1, title: 'Campaign Flag‑off in Agbani', date: '2026-08-10', excerpt: 'Thousands gathered as the campaign officially launched with a rally in Agbani Town Hall.' },
  { id: 2, title: 'Candidate Visits Rural Communities', date: '2026-08-05', excerpt: 'Town hall meetings held in Amurri and Akpugo to listen to community needs.' },
  { id: 3, title: 'Youth Endorsement Event', date: '2026-08-01', excerpt: 'Youth groups from across the constituency pledged support.' },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-apc-primary mb-8">Latest News</h1>
        <div className="space-y-6">
          {newsItems.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {item.date}
              </div>
              <h2 className="text-2xl font-semibold text-apc-primary mb-2">{item.title}</h2>
              <p className="text-gray-700">{item.excerpt}</p>
              <button className="mt-4 text-apc-primary font-medium hover:underline">Read more →</button>
            </article>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-10">More updates will appear here as the campaign progresses.</p>
      </div>
      <Footer />
    </div>
  );
}