"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  Users,
  Target,
  Heart,
  MapPin,
  Tag,
  Loader2,
  FileText,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ElectionCountdown from "@/components/home/ElectionCountdown";

import { getPublishedNews } from "@/lib/firebase/firestore";
import { getCurrentTenant } from "@/lib/firebase/tenants";

import type { NewsArticle, EventData } from "@/types";

export default function HomePage() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        setNewsLoading(true);

        await getCurrentTenant();

        const newsData = await getPublishedNews(3);

        setLatestNews(newsData);
        setEvents([]);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setNewsLoading(false);
      }
    }

    loadHomepageData();
  }, []);

  function formatDate(rawTimestamp: any) {
    if (!rawTimestamp) return "Recent";

    let date: Date;

    if (rawTimestamp.seconds) {
      date = new Date(rawTimestamp.seconds * 1000);
    } else if (
      typeof rawTimestamp === "string" ||
      typeof rawTimestamp === "number"
    ) {
      date = new Date(rawTimestamp);
    } else {
      return "Recent";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

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

          {newsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin text-apc-primary" />
              <p className="text-sm font-medium">Loading campaign updates…</p>
            </div>
          ) : latestNews.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />

              <p className="text-base font-medium text-gray-700">
                No published news articles yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Check back soon for news and updates from the campaign team.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {latestNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {article.featured_image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-apc-primary/10 to-apc-secondary/10">
                      <span className="text-2xl font-bold text-apc-primary/20">
                        Ifeanyi 2027
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-apc-primary" />

                        {formatDate(article.published_at || article.created_at)}
                      </span>

                      {article.category && (
                        <span className="flex items-center gap-1 rounded bg-apc-primary/10 px-2 py-0.5 font-medium text-apc-primary">
                          <Tag className="h-3 w-3" />

                          {article.category}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-apc-primary">
                      {article.title}
                    </h3>

                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                      {article.excerpt || article.content}
                    </p>

                    <div className="inline-flex items-center text-sm font-semibold text-apc-primary">
                      Read story
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-apc-primary md:text-4xl">
            Upcoming Events
          </h2>

          {events.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-8 text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-base font-medium text-gray-700">
                No upcoming events at the moment.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Check back soon for campaign events and community engagements.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl bg-gray-50 p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-center space-x-2 text-apc-green">
                    <Calendar className="h-5 w-5" />

                    <span className="font-medium">
                      {formatDate(event.date)}
                    </span>
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
          )}
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
