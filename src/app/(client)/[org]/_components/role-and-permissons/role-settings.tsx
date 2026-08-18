import React from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Pen } from "lucide-react";
import RoleModal from "./role-modal";
import { cn } from "~/lib/utils";

interface RoleSettingsProps {
  id: string;
  roleName: string;
  description: string;
  actions: Array<{ label: string }>;
  permissions: any;
  isCurrentUserRole?: boolean;
  canEdit?: boolean;
}

const RoleSettings: React.FC<RoleSettingsProps> = ({
  id,
  roleName,
  description,
  actions,
  permissions,
  isCurrentUserRole = false,
  canEdit = false,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <Card
      className={cn(
        "w-full",
        isCurrentUserRole && "border-[#7141F8] ring-1 ring-[#7141F8]/20"
      )}
    >
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isNew={false}
        roleId={id}
        roleName={roleName}
        description={description}
        permissions={permissions}
      />
      <CardContent className="p-3">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {roleName}
                </h2>
                {isCurrentUserRole && (
                  <Badge className="bg-[#7141F8] text-white hover:bg-[#7141F8]">
                    Your role
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            {canEdit ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 border rounded-md"
                onClick={() => setIsModalOpen(true)}
              >
                <Pen className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="border-t border-dotted border-gray-200 [border-style:dotted_8px]" />

          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Badge
                className="text-sm text-gray-700 border border-[#E6EAEF] bg-[#F6F7F9] w-fit rounded-sm"
                key={index}
              >
                {action.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSettings;
