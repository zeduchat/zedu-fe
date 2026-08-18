"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PlusIcon, XCircle } from "lucide-react";
import { agentCategories } from "~/data/agent-categories";
import { useContext, useState } from "react";
import { useParams } from "next/navigation";
import { PostRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showSuccess } from "~/components/toast/sonner";

const snapshotSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const formSchema = z.object({
  short_description: z
    .string()
    .min(1, "Short Description is required.")
    .max(50, "Short Description must be at most 50 characters long."),
  long_description: z
    .string()
    .min(1, "Long Description is required.")
    .max(1500, "Long Description must be at most 1500 characters long."),
  category: z.string().min(1, "Category is required."),
  snapshots: z
    .array(snapshotSchema)
    .nonempty("At least one snapshot is required."),
  how_it_works: z
    .string()
    .min(105, "This field must be at least 105 characters long."),
  benefits: z
    .string()
    .min(105, "This field must be at least 105 characters long."),
  why_use: z
    .string()
    .min(105, "This field must be at least 105 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PublishForm() {
  const [buttonLoading, setButtonLoading] = useState(false);
  const { id } = useParams();
  const { state, dispatch } = useContext(DataContext);
  const { agentCallback, colleague } = state;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      short_description: colleague?.short_description || "",
      long_description: colleague?.long_description || "",
      category: colleague?.category || "Knowledge Management",
      snapshots: colleague?.snapshots?.length
        ? colleague.snapshots
        : [{ title: "", description: "" }],
      how_it_works: colleague?.how_it_works || "",
      benefits: colleague?.benefits || "",
      why_use: colleague?.why_use || "",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "snapshots",
    control: form.control,
  });

  const onSubmit = async (data: FormValues) => {
    setButtonLoading(true);

    const res = await PostRequest(`/agents/${id}/publish`, data);
    if (res.status === 200 || res.status === 201) {
      dispatch({ type: ACTIONS.AGENT_CALLBACK, payload: !agentCallback });
      showSuccess(res.data.message);
    }

    setButtonLoading(false);
  };

  const shortDescriptionLength = form.watch("short_description")?.length || 0;
  const longDescriptionLength = form.watch("long_description")?.length || 0;

  return (
    <div className="my-10 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:outline-none focus:ring-1 focus:ring-primary-500 w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agentCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Provide a concise summary..."
                      {...field}
                      maxLength={50}
                      className="focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    {shortDescriptionLength}/50 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="long_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Long Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed description..."
                    className="min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...field}
                    maxLength={1500}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  {longDescriptionLength}/1500 characters
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-base">Snapshots</FormLabel>
              <Button
                type="button"
                onClick={() => append({ title: "", description: "" })}
                variant="outline"
                size="icon"
                className="hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-600"
              >
                <FormField
                  control={form.control}
                  name={`snapshots.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Quick Start"
                          {...field}
                          className="focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`snapshots.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Get started quickly"
                          {...field}
                          className="focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    size="icon"
                    className="text-red-500 cursor-pointer"
                  >
                    <XCircle className="h-6 w-6" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="how_it_works"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How It Works</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="This agent connects to..."
                    className="min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Using this agent helps..."
                    className="min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="why_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why Use</FormLabel>
                <FormControl className="focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <Textarea
                    placeholder="This agent offers unique value..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full bg-primary-500 text-white w-40"
            >
              Publish {buttonLoading && <Loading />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
