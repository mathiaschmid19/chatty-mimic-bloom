import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableModels, ModelOption } from "@/lib/openRouter";
import { Sparkles } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
}) => {
  // Find the selected model name
  const selectedModelName =
    availableModels.find((model) => model.id === selectedModel)?.name || "";

  return (
    <div className="py-2 flex justify-end">
      <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 shadow-sm">
        <Sparkles className="h-4 w-4 text-white mr-2" />
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-[160px] border-none bg-transparent text-white font-medium focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
            <SelectValue placeholder="Select Model">
              {selectedModelName}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            {availableModels.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium dark:text-white">
                    {model.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModelSelector;
