import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Camera } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-apc-primary mb-8">Gallery</h1>
        <p className="text-lg text-gray-600 mb-10">Photos from campaign events, community visits, and volunteer activities.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-8">Gallery will be populated with real images shortly.</p>
      </div>
      <Footer />
    </div>
  );
}