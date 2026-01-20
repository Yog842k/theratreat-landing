"use client";
import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Tags, 
  UserCheck, 
  Building2, 
  Store, 
  FileText, 
  ClipboardCheck, 
  ShoppingBag, 
  ArrowRight, 
  Code2 
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header Section */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">TheraTreat Admin</h1>
            <p className="text-xs text-slate-500 font-medium">System Control Center</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Welcome back. Manage your platform's verification requests, content, store inventory, and clinical tools from a central hub.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 1. TheraStore Categories */}
          <DashboardCard
            icon={Tags}
            title="Store Categories"
            description="Organize product taxonomy, create categories, and manage sub-groups."
          >
            <ActionButton href="/admin/therastore/categories" primary>Manage Categories</ActionButton>
            <JsonButton href="/api/therastore/categories" />
          </DashboardCard>

          {/* 2. Therapist Verifications */}
          <DashboardCard
            icon={UserCheck}
            title="Therapist Approvals"
            description="Review credentials and approve pending therapist registration requests."
            alert // Optional: Visual indicator for pending items
          >
            <ActionButton href="/admin/verify/therapists" primary>Review Pending</ActionButton>
            <JsonButton href="/api/admin/therapists/pending" />
          </DashboardCard>

          {/* 3. Clinic Verifications */}
          <DashboardCard
            icon={Building2}
            title="Clinic Onboarding"
            description="Verify clinic details and activate new healthcare facility accounts."
          >
            <ActionButton href="/admin/verify/clinics" primary>Review Clinics</ActionButton>
            <JsonButton href="/api/admin/clinics/pending" />
          </DashboardCard>

          {/* 4. Vendor Verifications */}
          <DashboardCard
            icon={Store}
            title="Vendor Requests"
            description="Validate third-party sellers and approve their store access."
          >
            <ActionButton href="/admin/verify/vendors" primary>Review Vendors</ActionButton>
            <JsonButton href="/api/admin/vendors/pending" />
          </DashboardCard>

          {/* 5. Blogs */}
          <DashboardCard
            icon={FileText}
            title="TheraBlogs"
            description="Draft, upload, and publish content to the TheraBlogs hub."
          >
            <ActionButton href="/admin/therablogs" primary>Open Uploader</ActionButton>
            <JsonButton href="/api/admin/blogs" />
          </DashboardCard>

          {/* 6. TheraSelf Tests (Spans 1 col on LG, usually important) */}
          <DashboardCard
            icon={ClipboardCheck}
            title="TheraSelf Tests"
            description="Configure self-assessment tools, questions, and scoring logic."
          >
            <div className="flex flex-col gap-2 w-full">
              <ActionButton href="/admin/theraself/tests" primary>Manage Definitions</ActionButton>
              <div className="flex gap-2">
                 <ActionButton href="/theraself/tests" className="flex-1 text-center justify-center">Public Library</ActionButton>
                 <JsonButton href="/api/admin/theraself/tests" />
              </div>
            </div>
          </DashboardCard>

          {/* 7. TheraStore Products (Wide Card) */}
          <div className="md:col-span-2 lg:col-span-3">
             <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   <div className="flex gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl h-fit">
                         <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                         <h3 className="text-lg font-semibold text-slate-900">TheraStore Inventory</h3>
                         <p className="mt-1 text-sm text-slate-600 max-w-xl">
                            Full control over the e-commerce catalog. Add new SKUs, update pricing, manage stock levels, and review product performance.
                         </p>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      <Link 
                        href="/therastore/add-product" 
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                      >
                        Add Product <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link 
                        href="/therastore/products" 
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        View All
                      </Link>
                      <Link 
                        href="/api/therastore/products" 
                        className="inline-flex items-center justify-center p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                        title="View JSON"
                      >
                        <Code2 className="w-5 h-5" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>

          {/* 8. TheraStore Product Requests (Admin) */}
          <DashboardCard
            icon={ClipboardCheck}
            title="Product Requests"
            description="Approve or reject vendor-submitted products before publishing to the store."
          >
            <ActionButton href="/admin/therastore/product-requests" primary>Review Requests</ActionButton>
            <JsonButton href="/api/therastore/admin/product-requests" />
          </DashboardCard>

        </div>
      </main>
    </div>
  );
}

// --- Reusable UI Components ---

function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  alert 
}: { 
  title: string, 
  description: string, 
  icon: any, 
  children: React.ReactNode, 
  alert?: boolean 
}) {
  return (
    <section className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className={`p-3 rounded-xl ${alert ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
          {alert && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {children}
      </div>
    </section>
  )
}

function ActionButton({ href, children, primary, className = "" }: { href: string, children: React.ReactNode, primary?: boolean, className?: string }) {
  return (
    <Link 
      href={href} 
      className={`
        inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
        ${primary 
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100 flex-1 justify-center" 
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200"
        }
        ${className}
      `}
    >
      {children}
    </Link>
  )
}

function JsonButton({ href }: { href: string }) {
  return (
    <Link 
      href={href} 
      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
      title="View JSON Data"
    >
      <Code2 className="w-4 h-4" />
    </Link>
  )
}