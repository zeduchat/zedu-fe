"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import N8nCredentialsModal, { CredentialTypeSchema } from "./credentials-modal";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import { useParams } from "next/navigation";
import { showSuccess } from "~/components/toast/sonner";

export interface Credential {
  id: string;
  name: string;
  displayName?: string;
  icon?: string;
  description?: string;
  credentials: CredentialTypeSchema[];
}

export function CredentialDropdown() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>([]);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [selectedNode, setSelectedNode] = useState<CredentialTypeSchema | null>(
    null
  );
  const { state } = useContext(DataContext);
  const { skill } = state;
  const credentialName = skill?.config?.credentials[0].name;
  const { id } = useParams();
  const [callback, setCallback] = useState(false);

  // request to get the added credentials list
  useEffect(() => {
    const getCredentials = async () => {
      const res = await GetRequest(`/credentials/skill/${skill.skill_id}`);
      if (res.status === 200 || res.status === 201) {
        setCredentials(res.data.data);
      }
    };
    getCredentials();
  }, [callback]);

  // Request to fetch credential properties
  useEffect(() => {
    const getCredentialProperties = async () => {
      const res = await GetRequest(
        `/skills/${skill.skill_id}/credential/config/${credentialName}`
      );
      if (res.status === 200 || res.status === 201) {
        setSelectedNode(res.data.data.credentials);
      }
    };
    getCredentialProperties();
  }, [credentialName, skill.skill_id]);

  const handleSave = async (credential: Credential) => {
    const orgId = localStorage.getItem("orgId") || "";
    const payload = {
      name: selectedNode?.name,
      org_id: orgId,
      agent_id: id,
      skill_id: skill?.skill_id,
      credentials: credential,
    };

    const res = await PostRequest(`/credentials`, payload);
    if (res.status === 200 || res.status === 201) {
      setCallback(!callback);
      showSuccess(res.data.message);
      setIsModalOpen(false);
    }
  };

  const handleSelect = (selectedName: string) => {
    setSelectedSchema(selectedName);
    const selectedCredential = credentials?.find(
      (cred: any) => cred.name === selectedName
    );
    if (selectedCredential) {
      handleSave(selectedCredential);
    }
  };

  //

  return (
    <div className="space-y-1 mb-4">
      <Label htmlFor="credentials">Add Credentials</Label>
      <div className="flex w-full items-center space-x-2">
        <Select value={selectedSchema} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a credential..." />
          </SelectTrigger>

          <SelectContent>
            {credentials.map((cred: any) => (
              <SelectItem
                key={cred.id}
                value={cred.name}
                className="!p-0 !pl-3 !pr-0 cursor-pointer"
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  {cred.icon ? (
                    typeof cred.icon === "string" &&
                    cred.icon.startsWith("http") ? (
                      <img
                        src={cred.icon}
                        alt={cred.displayName || cred.name}
                        className="w-5 h-5 rounded-sm"
                      />
                    ) : (
                      <span className="text-lg">{cred.icon}</span>
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-sm bg-gray-200 flex items-center justify-center text-xs">
                      🔑
                    </div>
                  )}
                  <span>{cred.displayName || cred.name}</span>
                </div>
              </SelectItem>
            ))}

            <Separator className="my-2" />

            <div
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add new credential</span>
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Credential Modal */}
      <N8nCredentialsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        schema={selectedNode}
        onSave={handleSave}
      />
    </div>
  );
}
