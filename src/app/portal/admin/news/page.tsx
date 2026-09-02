'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">News</h1>
        <button className="flex items-center space-x-2 bg-apc-primary text-white px-4 py-2 rounded-lg hover:bg-apc-dark transition-colors">
          <Plus className="h-5 w-5" />
          <span>New Article</span>
        </button>
      </div>

      <Card>
        <CardHeader><CardTitle>Published Articles</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-semibold">Campaign Flag‑off in Agbani</h3>
              <p className="text-sm text-gray-500">Published on Aug 10, 2026 · Status: Published</p>
            </div>
            <div className="border-b pb-3">
              <h3 className="font-semibold">Candidate Visits Rural Communities</h3>
              <p className="text-sm text-gray-500">Published on Aug 5, 2026 · Status: Published</p>
            </div>
            <div className="border-b pb-3">
              <h3 className="font-semibold">Youth Endorsement Event</h3>
              <p className="text-sm text-gray-500">Published on Aug 1, 2026 · Status: Published</p>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">Full news management will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
