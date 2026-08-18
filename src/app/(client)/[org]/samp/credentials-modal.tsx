import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import DOMPurify from "dompurify";

export type CredentialProperty = {
  displayName: string;
  name: string;
  type: "string" | "password" | "options" | "boolean" | "json" | "number";
  default?: any;
  placeholder?: string;
  description?: string;
  options?: { name: string; value: string }[];
  required?: boolean;
};

export type CredentialTypeSchema = {
  name: string;
  displayName: string;
  icon?: string;
  description?: string;
  properties: CredentialProperty[];
};

type FieldProps = {
  prop: CredentialProperty;
  control: any;
  register: any;
  error?: string;
};

function RenderField({ prop, control, register, error }: FieldProps) {
  // Boolean fields are rendered differently - label is part of the checkbox
  if (prop.type === "boolean") {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 h-10">
          <Controller
            control={control}
            name={prop.name}
            defaultValue={!!prop.default}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id={prop.name}
              />
            )}
          />
          <Label htmlFor={prop.name} className="cursor-pointer font-normal">
            {prop.description || prop.displayName}
          </Label>
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  let htmlWithLinks = prop.description ?? "";

  // Only convert plain URLs to clickable links — but skip if already inside an <a> tag
  htmlWithLinks = htmlWithLinks.replace(
    /(?<!["'>])(https?:\/\/[^\s)<>"]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );

  // Configure DOMPurify hook to style <a> tags safely
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
      node.classList.add(
        "text-primary-500",
        "underline",
        "hover:text-primary-600",
        "transition-colors"
      );
    }
  });

  // Render other field types
  let fieldContent: React.ReactNode = null;

  switch (prop.type) {
    case "string":
      fieldContent = (
        <Input
          type="text"
          placeholder={
            prop.placeholder || `Enter ${prop.displayName.toLowerCase()}`
          }
          {...register(prop.name, { required: prop.required })}
          defaultValue={prop.default || ""}
          className="w-full"
        />
      );
      break;
    case "password":
      fieldContent = (
        <Input
          type="password"
          placeholder={
            prop.placeholder || `Enter ${prop.displayName.toLowerCase()}`
          }
          {...register(prop.name, { required: prop.required })}
          defaultValue={prop.default || ""}
          className="w-full"
        />
      );
      break;
    case "number":
      fieldContent = (
        <Input
          type="number"
          placeholder={
            prop.placeholder || `Enter ${prop.displayName.toLowerCase()}`
          }
          {...register(prop.name, {
            required: prop.required,
            valueAsNumber: true,
          })}
          defaultValue={prop.default || ""}
          className="w-full"
        />
      );
      break;
    case "options":
      fieldContent = (
        <Controller
          control={control}
          name={prop.name}
          defaultValue={prop.default ?? prop.options?.[0]?.value ?? ""}
          rules={{ required: prop.required }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {prop.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
      break;
    case "json":
      fieldContent = (
        <Textarea
          placeholder={prop.placeholder || "{\n  \n}"}
          {...register(prop.name, {
            required: prop.required,
            validate: (value: any) => {
              if (!value || value.trim() === "") return true;
              try {
                JSON.parse(value);
                return true;
              } catch {
                return "Invalid JSON format";
              }
            },
          })}
          defaultValue={prop.default ?? ""}
          className="font-mono text-sm min-h-[120px]"
        />
      );
      break;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={prop.name} className="text-sm font-medium">
          {prop.displayName}
          {prop.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      {fieldContent}
      {prop.description && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(htmlWithLinks),
            }}
          />
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

type N8nCredentialsModalProps = {
  open: boolean;
  onOpenChange: any;
  schema: CredentialTypeSchema | null;
  onSave?: any;
};

export default function N8nCredentialsModal({
  open,
  onOpenChange,
  schema,
  onSave,
}: N8nCredentialsModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form when schema changes
  useEffect(() => {
    if (schema) {
      const defaultValues: Record<string, any> = {};
      schema.properties.forEach((prop) => {
        if (prop.type === "boolean") {
          defaultValues[prop.name] = !!prop.default;
        } else if (prop.type === "options") {
          defaultValues[prop.name] =
            prop.default ?? prop.options?.[0]?.value ?? "";
        } else {
          defaultValues[prop.name] = prop.default ?? "";
        }
      });
      reset(defaultValues);
    }
  }, [schema, reset]);

  const onSubmit = async (data: any) => {
    if (onSave) {
      await onSave(data);
    }
  };

  if (!schema) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            {schema.icon ? (
              <div className="flex-shrink-0 w-12 h-12 border rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                <img
                  src={schema.icon}
                  alt={schema.displayName}
                  className="w-8 h-8 object-contain"
                />
              </div>
            ) : (
              <div className="border flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🔑</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold">
                {schema.displayName} Credentials
              </DialogTitle>
              {schema.description && (
                <DialogDescription className="text-sm mt-1">
                  {schema.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid gap-6">
            {schema.properties.map((prop) => (
              <RenderField
                key={prop.name}
                prop={prop}
                control={control}
                register={register}
                error={errors[prop.name]?.message as string}
              />
            ))}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before saving.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-500 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Credentials"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
