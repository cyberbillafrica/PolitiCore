import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function BiographyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-apc-primary mb-8">Biography</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            [Candidate Full Name] is a dedicated public servant with over 15
            years of experience in community development and grassroots
            mobilization. Born and raised in Nkanu West, he understands the
            unique challenges and opportunities facing our constituency.
          </p>
          <p>
            A graduate of [University] with a degree in [Field], he has served
            in various capacities including [previous roles]. His commitment to
            transparency, accountability, and inclusive governance drives his
            vision for Nkanu West.
          </p>
          <p>
            This biography will be updated with detailed career history,
            achievements, and personal background shortly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="text-center p-6 bg-apc-light rounded-xl">
              <div className="text-3xl font-bold text-apc-primary">15+</div>
              <div className="text-sm text-gray-600 mt-1">
                Years of Experience
              </div>
            </div>
            <div className="text-center p-6 bg-apc-light rounded-xl">
              <div className="text-3xl font-bold text-apc-primary">50+</div>
              <div className="text-sm text-gray-600 mt-1">
                Communities Served
              </div>
            </div>
            <div className="text-center p-6 bg-apc-light rounded-xl">
              <div className="text-3xl font-bold text-apc-primary">1000+</div>
              <div className="text-sm text-gray-600 mt-1">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
