import React from "react";
import { FileText } from "lucide-react";

interface PdfPreviewProps {
  file: {
    file_name: string;
    file_link: string;
  };
  item: any;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  return (
    <div className="border rounded-lg shadow-sm bg-white min-h-[200px] w-[200px] overflow-hidden">
      <a href={file.file_link} target="_blank" rel="noopener noreferrer">
        {/* Top Section - File Info */}
        <div className="flex items-center justify-between p-3 px-2 border-b bg-gray-50">
          <div className="flex items-center gap-2 w-full min-w-0">
            <FileText size={20} className="text-red-500 flex-shrink-0" />
            <div className="text-xs font-medium text-gray-900 truncate min-w-0">
              {file.file_name}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-10">
          <FileText size={50} className="text-red-500" />
        </div>
      </a>
    </div>
  );
};

export default PdfPreview;
