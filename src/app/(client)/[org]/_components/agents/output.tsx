"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import Select, { MultiValue } from "react-select";

const allChannels = [
  "#general",
  "#new-signups",
  "#announcements",
  "#team-delve",
  "#team-zedu",
  "#the-combats",
  "#the-shakers",
  "#the-circle",
];

const allAgents = [
  "@Maya - Team Performance Monitor",
  "@Lexa - Language Translator",
];

type OptionType = {
  label: string;
  value: string;
};

const channelOptions: OptionType[] = allChannels.map((c) => ({
  label: c,
  value: c,
}));

const agentOptions: OptionType[] = allAgents.map((a) => ({
  label: a,
  value: a,
}));

export default function OutputSettings() {
  const [outputToEnabledChannels, setOutputToEnabledChannels] = useState(true);
  const [outputToSpecificChannels, setOutputToSpecificChannels] =
    useState(true);
  const [outputToAnotherAgent, setOutputToAnotherAgent] = useState(true);

  const [selectedChannels, setSelectedChannels] = useState<OptionType[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<OptionType[]>([]);

  const toggleSelection = (
    value: string,
    currentList: OptionType[],
    setList: any
  ) => {
    setList(currentList.filter((item) => item.value !== value));
  };

  const availableChannels = channelOptions.filter(
    (option) => !selectedChannels?.find((sel) => sel.value === option.value)
  );

  const availableAgents = agentOptions.filter(
    (option) => !selectedAgents?.find((sel) => sel.value === option.value)
  );

  return (
    <div className="space-y-6 max-w-lg py-6">
      {/* Output to enabled channels */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="output-enabled"
          checked={outputToEnabledChannels}
          onCheckedChange={() =>
            setOutputToEnabledChannels(!outputToEnabledChannels)
          }
          className="h-5 w-5"
        />
        <label htmlFor="output-enabled" className="text-sm font-medium">
          Output to channels where I am enabled
        </label>
      </div>

      {/* Output to specific channels */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="output-specific"
            checked={outputToSpecificChannels}
            onCheckedChange={() =>
              setOutputToSpecificChannels(!outputToSpecificChannels)
            }
            className="h-5 w-5"
          />
          <label htmlFor="output-specific" className="text-sm font-medium">
            Output to a specific channel
          </label>
        </div>

        {outputToSpecificChannels && (
          <Select
            isMulti
            options={availableChannels}
            value={null}
            onChange={(selected) => {
              const values = (selected as MultiValue<OptionType>) || [];
              const merged = [
                ...selectedChannels,
                ...values.filter(
                  (val) => !selectedChannels?.find((c) => c.value === val.value)
                ),
              ];
              setSelectedChannels(merged);
            }}
            placeholder="Choose channel(s)"
            className="w-100 text-sm"
            classNames={{
              control: () =>
                "!border-gray-300 !shadow-none !min-h-[38px] !cursor-pointer",
              multiValue: () => "hidden",
              valueContainer: () => "py-1",
            }}
          />
        )}

        {outputToSpecificChannels && selectedChannels.length > 0 && (
          <div className="border rounded px-2 py-2 flex flex-wrap gap-2">
            {selectedChannels.map((channel) => (
              <span
                key={channel.value}
                className="flex items-center bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded"
              >
                {channel.label}
                <button
                  onClick={() =>
                    toggleSelection(
                      channel.value,
                      selectedChannels,
                      setSelectedChannels
                    )
                  }
                  className="ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Output to another agent */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="output-agent"
            checked={outputToAnotherAgent}
            onCheckedChange={() =>
              setOutputToAnotherAgent(!outputToAnotherAgent)
            }
            className="h-5 w-5"
          />
          <label htmlFor="output-agent" className="text-sm font-medium">
            Output to another agent
          </label>
        </div>

        {outputToAnotherAgent && (
          <Select
            isMulti
            options={availableAgents}
            value={null}
            onChange={(selected) => {
              const values = (selected as MultiValue<OptionType>) || [];
              const merged = [
                ...selectedAgents,
                ...values.filter(
                  (val) => !selectedAgents?.find((a) => a.value === val.value)
                ),
              ];
              setSelectedAgents(merged);
            }}
            placeholder="Choose agent(s)"
            className="w-100 text-sm"
            classNames={{
              control: () =>
                "!border-gray-300 !shadow-none !min-h-[38px] !cursor-pointer",
              multiValue: () => "hidden",
              valueContainer: () => "py-1",
            }}
          />
        )}

        {outputToAnotherAgent && selectedAgents.length > 0 && (
          <div className="border rounded px-2 py-2 flex flex-wrap gap-2">
            {selectedAgents.map((agent) => (
              <span
                key={agent.value}
                className="flex items-center bg-indigo-50 text-blue-700 text-sm px-2 py-1 rounded"
              >
                {agent.label}
                <button
                  onClick={() =>
                    toggleSelection(
                      agent.value,
                      selectedAgents,
                      setSelectedAgents
                    )
                  }
                  className="ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
