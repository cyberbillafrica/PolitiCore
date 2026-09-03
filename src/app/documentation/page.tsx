import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  PlusCircle,
  CheckCircle2,
  Lock,
  Globe,
  HelpCircle,
  Layout,
  Tag,
  Image as ImageIcon,
  Clock,
  Archive,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "User Manual & Documentation | Ifeanyichukwu 2027",
  description: "User manual and technical documentation for the Ifeanyi 2027 News System and campaign portal.",
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-10 text-center sm:text-left border-b pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-apc-primary/10 px-4 py-1.5 text-xs font-semibold text-apc-primary mb-3">
            <BookOpen className="h-4 w-4" />
            Campaign User Manual & Technical Docs
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            News System & Platform Guide
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Comprehensive user manual for campaign administrators and technical overview of the News CMS architecture.
          </p>
        </div>

        <div className="space-y-12">
          {/* SECTION 1: USER MANUAL FOR ADMINISTRATORS */}
          <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-apc-primary mb-6">
              <FileText className="h-7 w-7 shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">
                Administrator User Manual: News Management
              </h2>
            </div>

            <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
              {/* Introduction */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Overview of the News System</h3>
                <p>
                  The News system allows authorized campaign managers to publish official press releases, event reports, policy statements, and ward visit updates. Published articles automatically appear on the public <Link href="/news" className="text-apc-primary underline">News Page</Link> and the campaign <Link href="/" className="text-apc-primary underline">Homepage</Link>.
                </p>
              </div>

              {/* Accessing Admin Area */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Accessing the News Management CMS</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to the portal using your administrator email and password at <Link href="/login" className="text-apc-primary underline">/login</Link>.</li>
                  <li>In the left sidebar, navigate to <strong>Administration</strong> &rarr; <strong>News</strong> (or visit <Link href="/portal/admin/news" className="text-apc-primary underline">/portal/admin/news</Link>).</li>
                  <li>You will see the News CMS console displaying all current draft, published, scheduled, and archived articles.</li>
                </ol>
              </div>

              {/* Creating an Article */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. How to Create and Publish a New Article</h3>
                <p className="mb-3">Click the green <strong>"New Article"</strong> button at the top right of the News CMS page. A form modal will open with the following fields:</p>
                <div className="grid gap-4 sm:grid-cols-2 bg-gray-50 p-5 rounded-xl border">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <PlusCircle className="h-4 w-4 text-apc-primary" /> Article Title *
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Enter a clear title. The system automatically creates a clean URL slug (e.g. <code>/news/campaign-flag-off-agbani</code>).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-apc-primary" /> Category & Author
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Select a category (e.g. <em>Rally, Press Release, Statement</em>) and specify an author byline.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-apc-primary" /> Excerpt & Content *
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Provide a short 2-3 sentence summary for preview cards, followed by the full article body text.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-apc-primary" /> Featured Image
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Click <strong>Upload</strong> to select an image from your device or paste a direct image URL.
                    </p>
                  </div>
                </div>
              </div>

              {/* Publication Lifecycle */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4. Understanding Statuses & Publishing Workflow</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <span className="font-semibold text-xs text-yellow-800 uppercase tracking-wide bg-yellow-200 px-2 py-0.5 rounded">Draft</span>
                    <p className="text-xs text-yellow-900">Saved privately in the database. Not visible to public visitors.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                    <span className="font-semibold text-xs text-green-800 uppercase tracking-wide bg-green-200 px-2 py-0.5 rounded">Published</span>
                    <p className="text-xs text-green-900">Immediately live on the public site and candidate homepage.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="font-semibold text-xs text-blue-800 uppercase tracking-wide bg-blue-200 px-2 py-0.5 rounded">Scheduled</span>
                    <p className="text-xs text-blue-900">Saved with a future release timestamp for scheduled launch.</p>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-semibold text-xs text-gray-700 uppercase tracking-wide bg-gray-200 px-2 py-0.5 rounded">Archived</span>
                    <p className="text-xs text-gray-800">Hidden from the public site while preserving article records.</p>
                  </div>
                </div>
              </div>

              {/* Homepage Selection Rule */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5. How the Homepage Displays News</h3>
                <p>
                  The candidate homepage displays <strong>up to the 3 latest published news articles</strong> ordered by creation/publication date. As soon as a new article is set to <em>Published</em>, it automatically appears as the first card on the homepage.
                </p>
              </div>

              {/* Troubleshooting */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6. Troubleshooting & FAQs</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-2 border-apc-primary pl-3">
                    <p className="font-semibold text-gray-900">An article was created but does not appear on /news?</p>
                    <p className="text-gray-600 text-xs mt-0.5">Ensure the article status is set to <strong>Published</strong> rather than <em>Draft</em> or <em>Archived</em>.</p>
                  </div>
                  <div className="border-l-2 border-apc-primary pl-3">
                    <p className="font-semibold text-gray-900">An image fails to upload?</p>
                    <p className="text-gray-600 text-xs mt-0.5">Ensure the image is in PNG, JPEG, or WEBP format and under 5MB in size.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: TECHNICAL REFERENCE */}
          <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-apc-primary mb-6">
              <Globe className="h-7 w-7 shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">
                Technical Architecture & Developer Reference
              </h2>
            </div>

            <div className="space-y-6 text-sm text-gray-700">
              <p>
                The News module operates on Google Cloud Firestore (`news` collection) and Firebase Storage (`news/` directory).
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-xl border font-mono text-xs">
                  <p className="font-bold text-gray-900 mb-2 font-sans">Core Utility Helpers (`src/lib/firebase/firestore.ts`):</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>getPublishedNews(limit)</li>
                    <li>getAllNewsArticles()</li>
                    <li>getNewsArticleBySlug(slug)</li>
                    <li>createNewsArticle(data)</li>
                    <li>updateNewsArticle(id, data)</li>
                    <li>deleteNewsArticle(id)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border text-xs">
                  <p className="font-bold text-gray-900 mb-2">Firestore Security Policy (`firestore.rules`):</p>
                  <p className="text-gray-600 leading-relaxed">
                    Public unauthenticated read queries require <code>status == "published"</code> or <code>published == true</code> constraints. Full read/write access is restricted exclusively to authenticated users with <code>access_role == "admin"</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
