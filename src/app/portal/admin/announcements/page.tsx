'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <button className="flex items-center space-x-2 bg-apc-primary text-white px-4 py-2 rounded-lg hover:bg-apc-dark transition-colors">
          <Plus className="h-5 w-5" />
          <span>New Announcement</span>
        </button>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-semibold">Volunteer Meeting Saturday</h3>
              <p className="text-sm text-gray-500">Sent to all members · 2 days ago</p>
            </div>
            <div className="border-b pb-3">
              <h3 className="font-semibold">Election training for agents</h3>
              <p className="text-sm text-gray-500">Sent to campaign members · 5 days ago</p>
            </div>
            <div className="border-b pb-3">
              <h3 className="font-semibold">Social media challenge update</h3>
              <p className="text-sm text-gray-500">Sent to social members · 1 week ago</p>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">Announcement composer will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
