import React from "react";
import {
  Database,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
  Calendar,
  Lock,
} from "lucide-react";

const DataInformation = () => {
  const deletedData = [
    {
      icon: Users,
      title: "Profile Information",
      description: "Name, email, profile picture, and bio",
      retention: "Deleted immediately",
    },
    {
      icon: MessageSquare,
      title: "Messages & Conversations",
      description: "All your messages, chats, and communication history",
      retention: "Deleted after 30 days",
    },
    {
      icon: FileText,
      title: "Documents & Files",
      description: "Uploaded files, documents, and shared content",
      retention: "Deleted after 30 days",
    },
    {
      icon: ImageIcon,
      title: "Media & Attachments",
      description: "Photos, videos, and other media files",
      retention: "Deleted after 30 days",
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Preferences, customizations, and configurations",
      retention: "Deleted immediately",
    },
    {
      icon: Calendar,
      title: "Activity History",
      description: "Login history, activity logs, and usage data",
      retention: "Deleted after 90 days",
    },
  ];

  const retainedData = [
    {
      icon: Database,
      title: "Transaction Records",
      description:
        "Billing and payment history for legal and accounting purposes",
      retention: "Retained for 7 years (legal requirement)",
    },
    {
      icon: Lock,
      title: "Security Logs",
      description:
        "Anonymized security and fraud prevention logs for platform safety",
      retention: "Retained for 90 days (anonymized)",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full mb-6">
            <Database className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-900">
              Data Management
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Happens to Your Data?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transparency is important to us. Here's what data we delete and what
            we keep (and why)
          </p>
        </div>

        {/* Data That Will Be Deleted */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Data That Will Be Deleted
              </h3>
              <p className="text-gray-600">
                The following data will be permanently removed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <div className="inline-flex items-center px-2.5 py-1 bg-red-50 rounded-md">
                        <span className="text-xs font-medium text-red-700">
                          {item.retention}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data That Will Be Retained */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Data That Will Be Retained
              </h3>
              <p className="text-gray-600">
                Required by law or for legitimate business purposes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {retainedData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 rounded-md">
                        <span className="text-xs font-medium text-blue-700">
                          {item.retention}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-100">
          <h4 className="font-semibold text-gray-900 mb-3">
            ℹ️ Additional Information
          </h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>
                All data retention periods comply with GDPR, CCPA, and other
                applicable data protection regulations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>
                Anonymized and aggregated data may be retained for analytics and
                service improvement
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>
                You can request a copy of your data before deletion by
                contacting our support team
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DataInformation;
