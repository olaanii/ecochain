"use client";

import { useState } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Building2, Mail, FileText, Send, CheckCircle } from "lucide-react";

export default function SponsorRequestPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactInfo: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sponsor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2d3435] mb-2">Request Submitted</h1>
          <p className="text-[#5a6061] mb-6">
            Your sponsor request has been submitted. An admin will review it and get back to you within 1-2 business days.
          </p>
          <a
            href="/"
            className="inline-block rounded-xl bg-[#2d3435] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[#f2f4f4] rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-[#2d3435]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2d3435] mb-2">Request Sponsor Status</h1>
          <p className="text-sm text-[#5a6061]">
            Apply to become a sponsor and create eco-campaigns for your community.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2d3435] mb-2">
              Business / Organization Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6061]" />
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
                placeholder="e.g., GreenFleet Ltd"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d3435] mb-2">
              Contact Information
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6061]" />
              <input
                type="text"
                required
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
                placeholder="Email or phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d3435] mb-2">
              Reason for Sponsorship
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-[#5a6061]" />
              <textarea
                required
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10 resize-none"
                placeholder="Tell us about your organization and why you want to sponsor eco-campaigns..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? (
              <>Submitting...</>
            ) : (
              <>
                <Send size={15} />
                Submit Request
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-[#5a6061]">
          Your request will be reviewed by an admin. You'll receive a notification once approved.
        </p>
      </div>
    </div>
  );
}
