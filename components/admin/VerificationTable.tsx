"use client";
import React from "react";

type Item = {
  id: string;
  name: string;
  submittedAt: string;
  status?: "pending" | "approved" | "rejected";
};

export default function VerificationTable({ items, onApprove, onReject, onView }: {
  items: Item[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView?: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto md:overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Submitted</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-normal break-words">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.submittedAt}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {onView && (
                    <button onClick={() => onView(item.id)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">View</button>
                  )}
                  <button onClick={() => onApprove(item.id)} className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">Approve</button>
                  <button onClick={() => onReject(item.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
