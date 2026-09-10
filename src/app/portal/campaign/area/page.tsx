"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Flag,
  MapPin,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { getWardById, getPollingUnitById, getAllLGAs } from "@/lib/constants";
import {
  formatScopeType,
  getPrimaryOrganizationalScope,
  formatOrganizationalPosition,
} from "@/lib/organization";
import type {
  OrganizationalAssignment,
  OrganizationalPosition,
  ScopeType,
  LGA,
} from "@/types";

/*
 * ============================================================
 * CAMPAIGN AREA
 * ============================================================
 */

export default function CampaignAreaPage() {
  const { profile, assignments, accessLoading } = useAuth();
  const [lgas, setLgas] = useState<LGA[]>([]);

  useEffect(() => {
    async function loadLgasData() {
      const data = await getAllLGAs();
      setLgas(data);
    }
    loadLgasData();
  }, []);

  if (!profile) {
    return null;
  }

  const isAdmin =
    profile.access_role === "admin" ||
    profile.access_role === "tenant_super_admin" ||
    profile.access_role === "platform_super_admin";

  const primaryScope = getPrimaryOrganizationalScope(assignments);
  const hasAssignment = primaryScope.assignment !== null;

  /*
   * Registered electoral location
   */
  const ward = getWardById(profile.ward_id);
  const pollingUnit = getPollingUnitById(
    profile.ward_id,
    profile.polling_unit_id,
  );

  const wardLabel = ward ? `${ward.code} — ${ward.name}` : "Not available";
  const pollingUnitLabel = pollingUnit
    ? `${pollingUnit.code} — ${pollingUnit.name}`
    : "Not available";

  if (accessLoading) {
    return <CampaignAreaLoading />;
  }

  /*
   * ADMIN GLOBAL VIEW
   */
  if (isAdmin) {
    const totalWards = lgas.reduce((acc, lga) => acc + lga.wards.length, 0);
    const totalPUs = lgas.reduce(
      (acc, lga) =>
        acc + lga.wards.reduce((wAcc, w) => wAcc + w.pollingUnits.length, 0),
      0,
    );

    return (
      <div className="space-y-6 pb-8">
        <BackLink />

        <PageHeader
          title="Campaign Area (Global Admin)"
          description="Administrative oversight of the entire Enugu State campaign hierarchy."
        />

        <Card className="overflow-hidden border-apc-primary/20 bg-gradient-to-r from-apc-primary to-apc-dark text-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  System Administrative Scope
                </p>
                <h2 className="mt-1 text-2xl font-bold">Enugu State — Campaign Wide</h2>
                <p className="mt-2 text-sm text-white/80">
                  As an Administrator, you possess complete global visibility across all 17 LGAs.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4" />
                Global Admin Authority
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<Building2 className="h-5 w-5" />}
            title="LGAs"
            value={String(lgas.length || 17)}
            description="Total LGAs covered"
          />
          <SummaryCard
            icon={<MapPin className="h-5 w-5" />}
            title="Wards"
            value={String(totalWards || 260)}
            description="Electoral Wards covered"
          />
          <SummaryCard
            icon={<Vote className="h-5 w-5" />}
            title="Polling Units"
            value={String(totalPUs || 4000)}
            description="Polling Units covered"
          />
          <SummaryCard
            icon={<Users className="h-5 w-5" />}
            title="Coverage"
            value="100%"
            description="State-wide visibility"
          />
        </div>

        {/* Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Global Campaign Operations</CardTitle>
            <p className="text-sm text-gray-500">
              Access campaign management tools across all scopes.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <AreaAction
                icon={<Users className="h-5 w-5" />}
                title="All Members"
                description="View and manage the complete campaign member directory."
                href="/portal/campaign/members"
              />
              <AreaAction
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Assignments"
                description="Review and create organizational assignments across all LGAs."
                href="/portal/campaign/assignments"
              />
              <AreaAction
                icon={<Building2 className="h-5 w-5" />}
                title="Activities"
                description="View and coordinate state-wide campaign activities."
                href="/portal/campaign/activities"
              />
              <AreaAction
                icon={<Flag className="h-5 w-5" />}
                title="Field Reports"
                description="Review field reports from all electoral areas."
                href="/portal/campaign/reports"
              />
            </div>
          </CardContent>
        </Card>

        <RegisteredArea wardLabel={wardLabel} pollingUnitLabel={pollingUnitLabel} />
      </div>
    );
  }

  /*
   * NON-ADMIN WITHOUT ASSIGNMENT
   */
  if (!hasAssignment) {
    return (
      <div className="space-y-6 pb-8">
        <BackLink />

        <PageHeader
          title="My Campaign Area"
          description="Your organizational responsibility within the campaign."
        />

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                <ShieldCheck className="h-5 w-5 text-yellow-700" />
              </div>

              <div>
                <h2 className="font-semibold text-yellow-900">
                  No organizational assignment yet
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-yellow-800">
                  Your account is registered as a campaign member, but you have
                  not yet been assigned a campaign organizational position.
                </p>

                <p className="mt-3 text-sm text-yellow-800">
                  Once an administrator assigns you to a campaign area, your
                  organizational scope will appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RegisteredArea
          wardLabel={wardLabel}
          pollingUnitLabel={pollingUnitLabel}
        />
      </div>
    );
  }

  /*
   * NON-ADMIN WITH ASSIGNMENT
   */
  const assignment = primaryScope.assignment!;

  return (
    <div className="space-y-6 pb-8">
      <BackLink />

      <PageHeader
        title="My Campaign Area"
        description="Your organizational responsibility within the campaign."
      />

      <Card className="overflow-hidden border-apc-primary/20">
        <div className="bg-apc-primary px-6 py-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">
                Current Organizational Position
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {formatOrganizationalPosition(assignment.position)}
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Active Assignment
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <AreaInfo
              icon={<Building2 className="h-4 w-4" />}
              label="Organizational Scope"
              value={formatScopeType(assignment.scope_type)}
            />

            <AreaInfo
              icon={<MapPin className="h-4 w-4" />}
              label="Scope"
              value={assignment.scope_id}
            />

            <AreaInfo
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Assignment Status"
              value={formatAssignmentStatus(assignment.status)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Area Operations</CardTitle>

          <p className="text-sm text-gray-500">
            Campaign functions available for your organizational scope.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <AreaAction
              icon={<Users className="h-5 w-5" />}
              title="Members"
              description="View members belonging to your organizational area."
              href="/portal/campaign/members"
            />

            <AreaAction
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Assignments"
              description="Review campaign assignments associated with your area."
              href="/portal/campaign/assignments"
            />

            <AreaAction
              icon={<Building2 className="h-5 w-5" />}
              title="Activities"
              description="View campaign activities taking place in your area."
              href="/portal/campaign/activities"
            />

            <AreaAction
              icon={<Flag className="h-5 w-5" />}
              title="Field Reports"
              description="Review or submit campaign field reports."
              href="/portal/campaign/reports"
            />
          </div>
        </CardContent>
      </Card>

      <RegisteredArea
        wardLabel={wardLabel}
        pollingUnitLabel={pollingUnitLabel}
      />
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-apc-primary">Campaign Council</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/portal/dashboard"
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-apc-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Campaign Dashboard
    </Link>
  );
}

function AreaInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apc-primary/10 text-apc-primary">
            {icon}
          </div>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        <p className="mt-4 font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function AreaAction({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-apc-primary/30 hover:bg-gray-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apc-primary/10 text-apc-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-apc-primary" />
    </Link>
  );
}

function RegisteredArea({ wardLabel, pollingUnitLabel }: { wardLabel: string; pollingUnitLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Registered Electoral Area</CardTitle>
        <p className="text-sm text-gray-500">
          Your personal electoral registration is separate from your campaign organizational responsibility.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <AreaInfo icon={<MapPin className="h-4 w-4" />} label="Registered Ward" value={wardLabel} />
          <AreaInfo icon={<MapPin className="h-4 w-4" />} label="Registered Polling Unit" value={pollingUnitLabel} />
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignAreaLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

function formatAssignmentStatus(status: OrganizationalAssignment["status"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "suspended":
      return "Suspended";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}
