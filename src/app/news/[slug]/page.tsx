"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, Tag, ArrowLeft, User, Loader2, AlertCircle } from "lucide-react";
import { getNewsArticleBySlug } from "@/lib/firebase/firestore";
import type { NewsArticle } from "@/types";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function NewsArticleDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewsArticleBySlug(slug);
        if (!data || data.status !== "published") {
          setArticle(null);
        } else {
          setArticle(data);
        }
      } catch (err: any) {
        console.error("Error loading article:", err);
        setError("Unable to load article. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  function formatDate(rawTimestamp: any) {
    if (!rawTimestamp) return "Recent";
    let date: Date;
    if (rawTimestamp.seconds) {
      date = new Date(rawTimestamp.seconds * 1000);
    } else if (typeof rawTimestamp === "string" || typeof rawTimestamp === "number") {
      date = new Date(rawTimestamp);
    } else {
      return "Recent";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center text-sm font-semibold text-apc-primary hover:text-apc-dark transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Link>
        </div>

        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-apc-primary" />
            <p className="text-sm font-medium">Loading article…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 my-8">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && !article && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">
              The article you are looking for does not exist or is no longer published.
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-lg bg-apc-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-apc-dark"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to News Updates
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-10">
            {article.category && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-apc-primary/10 px-3 py-1 text-xs font-semibold text-apc-primary">
                <Tag className="h-3.5 w-3.5" />
                {article.category}
              </div>
            )}

            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl leading-tight">
              {article.title}
            </h1>

            <div className="mt-4 mb-8 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-apc-primary" />
                {formatDate(article.published_at || article.created_at)}
              </span>
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-apc-primary" />
                  {article.author}
                </span>
              )}
            </div>

            {article.featured_image && (
              <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            )}

            {article.excerpt && (
              <p className="mb-8 text-lg font-medium text-gray-700 leading-relaxed italic border-l-4 border-apc-primary pl-4 py-1 bg-gray-50/50 rounded-r">
                {article.excerpt}
              </p>
            )}

            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
