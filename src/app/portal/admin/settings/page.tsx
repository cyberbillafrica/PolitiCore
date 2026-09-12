'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-apc-primary" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Campaign name, default ward, election mode toggle.</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-apc-primary" />
                <span>Enable Election Mode</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-apc-primary" defaultChecked />
                <span>Allow Volunteer Registration</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-apc-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Manage email and in‑app notification preferences.</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-apc-primary" defaultChecked />
                <span>New member sign‑up alerts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-apc-primary" defaultChecked />
                <span>Task verification requests</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-apc-primary" />
              <span>Electoral Engine Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage election cycles, contests, INEC party masters, candidate configurations, and active collation contexts.
            </p>
            <div className="mt-4">
              <a
                href="/portal/admin/election"
                className="inline-flex items-center gap-2 px-4 py-2 bg-apc-primary text-white text-xs font-bold rounded-lg hover:bg-apc-dark transition-colors"
              >
                Open Admin Election Configurator &rarr;
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
