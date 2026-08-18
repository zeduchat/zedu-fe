import { X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Loading from "~/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PatchRequest } from "~/utils/new-request";

const initialState = {
  name: "",
  content: "",
  type: "",
};

interface Prompt {
  name: string;
  content: string;
  type: string;
  id: string;
}

interface PromptProps {
  open: boolean;
  setOpen: any;
  prompt: Prompt;
}

export default function EditPromptsModal({
  open,
  setOpen,
  prompt,
}: PromptProps) {
  const [values, setValues] = useState(initialState);
  const maxNameLength = 80;
  const { state, dispatch } = useContext(DataContext);
  const { id } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);

  // set default values
  useEffect(() => {
    setValues(prompt);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setValues({ ...values, type: value });
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    const payload = {
      name: values.name,
      content: values.content,
      type: values.type,
    };

    const res = await PatchRequest(
      `/agents/${id}/prompts/${prompt.id}`,
      payload
    );
    if (res.status === 200 || res.status === 201) {
      dispatch({
        type: ACTIONS.PROMPT_CALLBACK,
        payload: !state.promptCallback,
      });
      setOpen(false);
      setValues(initialState);
    }
    setButtonLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] rounded-xl px-0 py-6">
        <DialogHeader className="!flex !flex-row items-center justify-between px-6">
          <DialogTitle className="text-xl font-semibold">
            Update Prompt
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="p-1 rounded hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[480px] px-6 pt-4 border-t">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="name" className="text-sm font-medium">
                Prompt name
              </Label>
              <span className="text-xs text-gray-400">
                {values.name.length}/{maxNameLength}
              </span>
            </div>
            <Input
              id="name"
              name="name"
              placeholder="prompt name"
              value={values.name}
              onChange={handleChange}
              maxLength={maxNameLength}
              className="mt-2 focus:ring-primary-500 focus:ring-1 focus:ring-offset-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="content" className="text-sm font-medium">
              Prompt content
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="What should it do?"
              value={values.content}
              onChange={handleChange}
              className="mt-2 resize-none h-[80px] outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="type" className="text-sm font-medium">
              Prompt type
            </Label>
            <Select
              onValueChange={handleSelectChange}
              defaultValue={values.type}
            >
              <SelectTrigger className="mt-2 focus:ring-primary-500 focus:ring-1 focus:ring-offset-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tagged prompt">Tagged Prompt</SelectItem>
                <SelectItem value="perfonality prompt">
                  Personality Prompt
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500 p-4 border border-gray-200 rounded-md bg-gray-50 mt-6">
            <span className="font-semibold">Note:</span> Write clear, specific
            instructions so the AI knows exactly what to do every time this
            Prompts is mentioned
          </div>
        </div>
        <DialogFooter className="pt-6 flex justify-end gap-3 px-6 border-t">
          <Button
            className="bg-white border text-gray-800 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-primary-500 hover:bg-primary-700 text-white"
          >
            Update Prompt {buttonLoading && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
