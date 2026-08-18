import React from "react";
import { Trash2, Shield, AlertCircle } from "lucide-react";

const AccountDeletionHero = () => {
  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 px-6 pt-20 pb-16 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-100 rounded-full shadow-sm">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Data Privacy & Control
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Account Deletion
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Request Center
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At <span className="font-semibold text-gray-900">Zedu</span>, we
            respect your privacy and give you full control over your data.
            Request account deletion or learn more about what happens to your
            information.
          </p>

          {/* Info Alert */}
          <div className="inline-flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 text-left max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Important Notice</p>
              <p className="text-amber-800">
                Account deletion is permanent and cannot be undone. Please
                review the information below carefully before proceeding.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Full Deletion
              </h3>
              <p className="text-sm text-gray-600">
                All personal data removed from our systems
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                30-Day Window
              </h3>
              <p className="text-sm text-gray-600">
                Grace period to recover your account if needed
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                GDPR Compliant
              </h3>
              <p className="text-sm text-gray-600">
                Full compliance with data protection regulations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionHero;
