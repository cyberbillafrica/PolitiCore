import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  Users,
  Target,
  Heart,
  MapPin,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ElectionCountdown from "@/components/home/ElectionCountdown";

export default function HomePage() {
  const events = [
    {
      id: 1,
      title: "Ward-to-Ward Campaign Tour",
      date: "2026-08-15",
      time: "10:00 AM",
      venue: "Agbani Town Hall",
      ward: "Agbani",
    },
    {
      id: 2,
      title: "Youth Empowerment Summit",
      date: "2026-08-20",
      time: "11:00 AM",
      venue: "Community Center, Akpugo",
      ward: "Akpugo",
    },
    {
      id: 3,
      title: "Women's Town Hall Meeting",
      date: "2026-08-25",
      time: "2:00 PM",
      venue: "Ozalla Civic Center",
      ward: "Ozalla",
    },
  ];

  const newsArticles = [
    {
      id: 1,
      title: "APC Candidate Pledges Quality Representation for Nkanu West",
      excerpt:
        "Our candidate outlines comprehensive plan for constituency development...",
      date: "2026-08-10",
    },
    {
      id: 2,
      title: "Massive Turnout at Campaign Flag-off in Agbani",
      excerpt:
        "Thousands of supporters gather as campaign officially kicks off...",
      date: "2026-08-08",
    },
    {
      id: 3,
      title: "Infrastructure Development: A Key Priority",
      excerpt: "Road construction and rural electrification top the agenda...",
      date: "2026-08-05",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Election Countdown */}
      <ElectionCountdown />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-apc-primary to-apc-dark text-white">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-32 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Hero Content */}
            <div>
              <div className="mb-6 inline-block rounded-full border border-apc-green/30 bg-apc-green/20 px-4 py-2 text-sm font-medium">
                House of Assembly Candidate • Nkanu West
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                Building a{" "}
                <span className="text-apc-green">Brighter Future</span> for
                Nkanu West
              </h1>

              <p className="mb-8 text-lg text-gray-200 md:text-xl">
                Committed to responsive representation, sustainable development,
                and inclusive governance for every community in Nkanu West
                Constituency.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/volunteer"
                  className="inline-flex items-center justify-center rounded-lg bg-apc-green px-8 py-4 font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Join the Movement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  href="/manifesto"
                  className="inline-flex items-center justify-center rounded-lg bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Our Manifesto
                </Link>
              </div>
            </div>

            {/* Vision */}
            <div className="hidden md:block">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
                <h3 className="mb-6 text-2xl font-bold">Our Vision</h3>

                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <Target className="mt-1 h-6 w-6 flex-shrink-0 text-apc-green" />

                    <div>
                      <h4 className="font-semibold">
                        Infrastructure Development
                      </h4>

                      <p className="text-sm text-gray-300">
                        Modern roads, rural electrification, and water supply
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <Users className="mt-1 h-6 w-6 flex-shrink-0 text-apc-green" />

                    <div>
                      <h4 className="font-semibold">Youth Empowerment</h4>

                      <p className="text-sm text-gray-300">
                        Skills training, entrepreneurship, and job creation
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <Heart className="mt-1 h-6 w-6 flex-shrink-0 text-apc-green" />

                    <div>
                      <h4 className="font-semibold">Quality Healthcare</h4>

                      <p className="text-sm text-gray-300">
                        Accessible healthcare facilities and services
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Introduction */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Candidate Image */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-apc-primary/10 to-apc-secondary/10">
                <Image
                  src="/images/candidate.jpg"
                  alt="Candidate for Nkanu West Constituency"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            {/* Candidate Information */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-apc-primary md:text-4xl">
                Meet Your Candidate
              </h2>

              <div className="space-y-4 text-gray-600">
                <p className="text-lg">
                  A dedicated public servant with over 15 years of experience in
                  community development and grassroots mobilization.
                </p>

                <p>
                  Born and raised in Nkanu West, our candidate understands the
                  unique challenges and opportunities of our constituency. With
                  a proven track record of service and leadership, we are ready
                  to deliver quality representation at the Enugu State House of
                  Assembly.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-apc-primary">
                      15+
                    </div>

                    <div className="text-sm text-gray-500">
                      Years Experience
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-apc-primary">
                      50+
                    </div>

                    <div className="text-sm text-gray-500">
                      Communities Served
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-apc-primary">
                      1000+
                    </div>

                    <div className="text-sm text-gray-500">Volunteers</div>
                  </div>
                </div>
              </div>

              <Link
                href="/biography"
                className="mt-8 inline-flex items-center font-semibold text-apc-primary transition-colors hover:text-apc-dark"
              >
                Read Full Biography
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-apc-primary md:text-4xl">
              Latest News
            </h2>

            <Link
              href="/news"
              className="font-semibold text-apc-primary transition-colors hover:text-apc-dark"
            >
              View All →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {newsArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 bg-gradient-to-br from-apc-primary/10 to-apc-secondary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-apc-primary/20" />
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-sm text-gray-500">{article.date}</span>

                  <h3 className="mb-3 mt-2 text-lg font-semibold text-apc-primary transition-colors group-hover:text-apc-secondary">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-600">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-apc-primary md:text-4xl">
            Upcoming Events
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl bg-gray-50 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center space-x-2 text-apc-green">
                  <Calendar className="h-5 w-5" />

                  <span className="font-medium">{event.date}</span>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-apc-primary">
                  {event.title}
                </h3>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />

                    <span className="text-sm">{event.venue}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {event.ward} Ward
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">{event.time}</div>
                </div>

                <button className="mt-4 w-full rounded-lg bg-apc-primary px-4 py-2 text-white transition-colors hover:bg-apc-dark">
                  RSVP
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-apc-primary to-apc-dark py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Join Us in Building a Better Nkanu West
          </h2>

          <p className="mb-8 text-xl text-gray-200">
            Together, we can create lasting change through quality
            representation and community-focused governance.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center rounded-lg bg-apc-green px-8 py-4 font-semibold text-white transition-colors hover:bg-green-700"
            >
              Become a Volunteer
            </Link>

            <Link
              href="/portal/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Member Portal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
