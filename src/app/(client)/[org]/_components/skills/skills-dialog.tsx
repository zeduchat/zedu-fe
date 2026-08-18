"use client";

import React, { useContext, useState, useMemo } from "react";
import {
  Search,
  Check,
  X,
  ArrowUpDown,
  CheckCircle,
  PlusIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "next/image";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import images from "~/assets/images";
import { useParams } from "next/navigation";
import Loading from "~/components/ui/loading";

interface Skill {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
  is_configured: boolean;
  avatar: string;
  tags: string[] | null;
  created_at: string;
  config: any;
}

interface SelectedSkill {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  icon: string;
  config: any;
}

export function SkillsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: any;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("prompt-based");
  const { state, dispatch } = useContext(DataContext);
  const { agentSkills: skills } = state;
  const [saveLoading, setSaveLoading] = useState(false);
  const { id } = useParams();

  const categories = useMemo(() => {
    const allCategories = skills.reduce(
      (acc: { [key: string]: number }, skill: any) => {
        const type = skill.type;
        if (acc[type]) {
          acc[type] += 1;
        } else {
          acc[type] = 1;
        }
        return acc;
      },
      {}
    );

    return [
      { name: "All", count: skills.length },
      ...Object.keys(allCategories).map((name) => ({
        name,
        count: allCategories[name],
      })),
    ];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (skill: any) => skill.type === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (skill: any) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [skills, selectedCategory, searchQuery]);

  const handleSkillSelect = (skill: Skill) => {
    const isSelected = selectedSkills.some((s) => s.id === skill.skill_id);

    if (isSelected) {
      setSelectedSkills((prev) => prev.filter((s) => s.id !== skill.skill_id));
    } else {
      setSelectedSkills((prev) => [
        ...prev,
        {
          id: skill.skill_id,
          skill_id: skill.skill_id,
          name: skill.name,
          description: skill.description,
          icon: skill.avatar,
          config: skill.config,
          is_active: skill.is_active,
          is_configured: skill.is_configured,
        },
      ]);
    }
  };

  const handleSaveSkills = async () => {
    setSaveLoading(true);

    const payload = {
      skill_ids: selectedSkills.map((item) => item.id),
    };

    const res = await PostRequest(`/skills/agents/${id}`, payload);
    if (res.status === 200 || res.status === 201) {
      dispatch({
        type: ACTIONS.SKILLS_CALLBACK,
        payload: !state.skillsCallback,
      });
      dispatch({ type: ACTIONS.SELECTED_SKILLS, payload: selectedSkills });
      onOpenChange(false);
    }
    setSaveLoading(false);
  };

  //

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Add a Skill to {state.colleague?.name}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 border rounded h-6 w-6"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6 py-3 border-b">
          <div className="flex gap-6">
            <button
              className={`text-sm pb-2 border-b-2 transition-colors ${
                activeTab === "prompt-based"
                  ? "border-primary-500 text-blue-600 font-medium"
                  : "border-transparent text-[#667085] hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("prompt-based")}
            >
              Prompt-Based Suggestions{" "}
              <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                {filteredSkills?.length || 0}
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 h-[70vh]">
          {/* Left Sidebar */}
          <div className="hidden md:block w-full md:w-64 border-r p-4 overflow-y-auto">
            <h3 className="font-medium text-sm text-gray-900 mb-3">
              Filter by Category
            </h3>
            <Accordion type="multiple" className="w-full space-y-1">
              {categories.map((category) => (
                <AccordionItem
                  key={category.name}
                  value={category.name}
                  className="border-none"
                >
                  <AccordionTrigger
                    className={`hover:no-underline py-2 px-3 rounded-md text-sm font-normal justify-between ${
                      selectedCategory === category.name
                        ? "bg-[#F2F4F7] text-blue-600 shadow-sm"
                        : "hover:bg-[#F2F4F7]"
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          ({category.count})
                        </span>
                        {selectedCategory === category.name && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Sort */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center flex-wrap gap-2 md:gap-4">
                <div className="relative md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Find a Skill"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      Sort By <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Name A-Z</DropdownMenuItem>
                    <DropdownMenuItem>Name Z-A</DropdownMenuItem>
                    <DropdownMenuItem>Category</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSkills.map((skill: any) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.id === skill.skill_id
                  );
                  return (
                    <div
                      key={skill.skill_id}
                      className={`border rounded-lg transition-all overflow-hidden ${
                        isSelected
                          ? "border-2 border-primary-500 shadow-sm"
                          : "border-2 border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3 pt-4 pb-2 px-4">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          <div
                            className={`min-w-8 min-h-8 rounded-md flex items-center justify-center text-white text-sm bg-[#F1F1FE] border`}
                          >
                            <Image
                              src={skill.avatar || images.bot}
                              alt="skill"
                              width={20}
                              height={20}
                              unoptimized
                            />
                          </div>
                          <h4 className="font-medium text-sm text-gray-900">
                            {skill.name}
                          </h4>
                        </div>

                        <Button
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className={`flex items-center gap-1 text-xs px-2 ${
                            isSelected
                              ? "text-gray-500"
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                          onClick={() => handleSkillSelect(skill)}
                        >
                          {isSelected ? (
                            <CheckCircle size={13} />
                          ) : (
                            <PlusIcon size={15} className="mb-[2px]" />
                          )}
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </div>

                      <hr />

                      <div className="flex-1 min-w-0 p-4">
                        <p className="text-xs text-[#667085] leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSkills.length === 0 && (
                <div className="flex flex-col mt-20 items-center justify-center">
                  <Image
                    src="/image/empty-box.svg"
                    alt="empty skills"
                    width={100}
                    height={100}
                    unoptimized
                  />
                  <p className="text-gray-400">No skills found.</p>
                </div>
              )}
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="border-t bg-[#F1F1FE] p-2">
                <h4 className="text-xs font-medium text-gray-900 mb-3">
                  {selectedSkills.length} Selected Skill(s)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill.skill_id}
                      variant="secondary"
                      className="border gap-1 p-2 rounded-md text-blue-800 bg-white"
                    >
                      <Image
                        src={skill.icon ? skill.icon : images.bot}
                        alt="skill"
                        width={15}
                        height={15}
                        unoptimized
                        className="border rounded"
                      />
                      {skill.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                        onClick={() =>
                          setSelectedSkills((prev) =>
                            prev.filter((s) => s.id !== skill.skill_id)
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t bg-white p-4">
              <div className="flex items-center justify-end">
                {/* <p className="text-sm text-[#667085]">
                  Can't find what you're looking for?{" "}
                  <button onClick={() => router.push(`/`)} className="text-blue-600 hover:text-blue-700 underline">
                    Open Marketplace →
                  </button>
                </p> */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSkills}
                    className="bg-primary-500 text-white"
                    disabled={selectedSkills.length === 0}
                  >
                    Add Skills {saveLoading && <Loading />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
