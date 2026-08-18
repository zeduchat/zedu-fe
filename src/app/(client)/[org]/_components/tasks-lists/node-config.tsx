"use client";
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from "react";
import { ChevronsUpDown, Trash2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
} from "~/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DataContext } from "~/store/GlobalState";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PutRequest } from "~/utils/new-request";
import images from "~/assets/images";
import Loading from "~/components/ui/loading";
import { ACTIONS } from "~/store/Actions";
import { showError } from "~/components/toast/sonner";

type AnyObject = { [k: string]: any };

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function shouldDisplayField(
  field: any,
  allValues: AnyObject,
  rootValues?: AnyObject
): boolean {
  if (!field?.displayOptions) return true;

  const { show, hide } = field.displayOptions;
  const source = { ...(rootValues ?? {}), ...(allValues ?? {}) };

  if (show)
    for (const key in show) if (!show[key].includes(source[key])) return false;
  if (hide)
    for (const key in hide) if (hide[key].includes(source[key])) return false;

  return true;
}

function getDefaultForProp(prop: any): any {
  if (prop?.default !== undefined) return deepClone(prop.default);

  switch (prop?.type) {
    case "string":
    case "password":
    case "dateTime":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "options":
      return prop.options?.[0]?.value ?? "";
    case "multiOptions":
      return [];
    case "collection":
      if (
        prop.options &&
        typeof prop.default === "object" &&
        !Array.isArray(prop.default)
      ) {
        const obj: AnyObject = {};
        for (const child of prop.options ?? [])
          obj[child.name] = getDefaultForProp(child);
        return obj;
      }
      return [];
    case "fixedCollection":
      return [];
    default:
      return null;
  }
}

function computeInitialValues(schema: any[]) {
  const values: AnyObject = {};
  let changed = true;
  const MAX_PASSES = 6;

  for (let pass = 0; pass < MAX_PASSES && changed; pass++) {
    changed = false;
    for (const prop of schema) {
      const name = prop.name;
      if (values[name] !== undefined) continue;
      if (!prop.displayOptions || shouldDisplayField(prop, values, values)) {
        const def = getDefaultForProp(prop);
        if (
          prop.type === "collection" &&
          def &&
          typeof def === "object" &&
          !Array.isArray(def)
        ) {
          for (const child of prop.options ?? [])
            if (def[child.name] === undefined)
              def[child.name] = getDefaultForProp(child);
        }
        values[name] = def;
        changed = true;
      }
    }
  }
  return values;
}

// --- FieldRenderer ---
function FieldRenderer({
  prop,
  value,
  onChange,
  path,
  rootValues,
}: {
  prop: any;
  value: any;
  onChange: any;
  path: (string | number)[];
  allValues: AnyObject;
  rootValues?: AnyObject;
}) {
  const id = useMemo(() => path.join("_"), [path]);
  const set = useCallback((v: any) => onChange(path, v), [onChange, path]);
  const label = prop.displayName || prop.name || "";

  // --- simple types ---
  switch (prop.type) {
    case "string":
    case "password":
      return (
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type={prop.type === "password" ? "password" : "text"}
            placeholder={prop.placeholder}
            value={value ?? prop.default ?? ""}
            onChange={(e: any) => set(e.target.value)}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type="number"
            value={value ?? prop.default ?? ""}
            onChange={(e: any) =>
              set(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between rounded border p-2 bg-slate-50">
          <Label htmlFor={id}>{label}</Label>
          <Switch
            id={id}
            checked={Boolean(value ?? prop.default ?? false)}
            onCheckedChange={(val) => set(val)}
            className="bg-primary-500"
          />
        </div>
      );

    case "options":
      return (
        <div className="space-y-1">
          <Label>{label}</Label>
          <Select
            value={value === "" ? "__empty__" : (value ?? prop.default ?? "")}
            onValueChange={(val) => set(val === "__empty__" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {(prop.options ?? []).map((opt: any) => {
                const optVal =
                  opt.value === "" ? "__empty__" : String(opt.value);
                return (
                  <SelectItem key={optVal} value={optVal}>
                    {opt.name ?? opt.value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      );

    case "multiOptions":
      return (
        <div className="space-y-1">
          <Label>{label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between flex-wrap gap-1"
              >
                {value?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map((val: string) => {
                      const opt = (prop.options ?? [])?.find(
                        (o: any) => o.value === val
                      );
                      return (
                        <Badge
                          key={val}
                          variant="secondary"
                          className="rounded-lg px-2 py-0.5 text-xs border border-primary-500"
                        >
                          {opt?.name ?? val}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select {label}</span>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="p-0"
              style={{ width: "var(--radix-popover-trigger-width)" }}
            >
              <Command>
                <CommandInput placeholder={`Search ${label}...`} />
                <CommandList>
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup>
                    {(prop.options ?? []).map((opt: any) => {
                      const selected = (value ?? []).includes(opt.value);
                      return (
                        <CommandItem
                          key={String(opt.value)}
                          onSelect={() => {
                            const newValue = selected
                              ? value.filter((v: any) => v !== opt.value)
                              : [...(value ?? []), opt.value];
                            set(newValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {opt.name ?? opt.value}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );

    case "collection": {
      const isObjectCollection =
        (prop.default &&
          typeof prop.default === "object" &&
          !Array.isArray(prop.default)) ||
        (value && typeof value === "object" && !Array.isArray(value));

      if (isObjectCollection) {
        const obj = value ?? {};
        return (
          <div className="space-y-2 rounded border p-3 bg-white overflow-x-auto">
            <Label className="block font-semibold">{label}</Label>
            <div className="space-y-4">
              {(prop.options ?? []).map((child: any) =>
                shouldDisplayField(child, obj, rootValues) ? (
                  <FieldRenderer
                    key={child.name}
                    prop={child}
                    value={obj[child.name]}
                    onChange={onChange}
                    path={[...path, child.name]}
                    allValues={obj}
                    rootValues={rootValues}
                  />
                ) : null
              )}
            </div>
          </div>
        );
      }

      // Array-style
      const items: any[] = Array.isArray(value) ? value : [];
      const addItem = () => {
        const newItem: AnyObject = {};
        for (const child of prop.options ?? [])
          newItem[child.name] = child.default ?? null;
        set([...items, newItem]);
      };
      const updateItem = (index: number, key: string, v: any) => {
        const next = deepClone(items);
        next[index][key] = v;
        set(next);
      };
      const removeItem = (index: number) => {
        const next = deepClone(items);
        next.splice(index, 1);
        set(next);
      };

      return (
        <div className="space-y-2 rounded border p-3 bg-red-300">
          <Label className="block font-semibold">{label}</Label>
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 bg-slate-50 space-y-3"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <div className="font-medium">
                  {prop.displayName ?? prop.name} #{i + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="space-y-4">
                {(prop.options ?? []).map((child: any) =>
                  shouldDisplayField(child, it, rootValues) ? (
                    <FieldRenderer
                      key={child.name}
                      prop={child}
                      value={it[child.name]}
                      onChange={(p: any, v: any) =>
                        updateItem(i, child.name, v)
                      }
                      path={[...path, i, child.name]}
                      allValues={it}
                      rootValues={rootValues}
                    />
                  ) : null
                )}
              </div>
            </div>
          ))}
          <Button onClick={addItem}>+ Add {prop.placeholder ?? "set"}</Button>
        </div>
      );
    }

    case "fixedCollection": {
      const groups = prop.options ?? [];
      const items: any[] = Array.isArray(value) ? value : [];
      const addGroup = (groupName: string) => {
        const groupDef = groups?.find((g: any) => g.name === groupName);
        if (!groupDef) return;
        const obj: AnyObject = {};
        for (const f of groupDef.values ?? []) obj[f.name] = f.default ?? null;
        set([...items, { [groupName]: obj }]);
      };
      const updateGroup = (
        index: number,
        groupName: string,
        key: string,
        v: any
      ) => {
        const next = deepClone(items);
        next[index][groupName][key] = v;
        set(next);
      };
      const removeGroup = (index: number) => {
        const next = deepClone(items);
        next.splice(index, 1);
        set(next);
      };

      return (
        <div className="space-y-2 rounded border p-3 overflow-x-auto">
          <Label className="block font-semibold">{label}</Label>
          {items.map((groupItem, i) => {
            const groupName = Object.keys(groupItem)[0];
            const groupDef = groups?.find((g: any) => g.name === groupName);
            if (!groupDef) return null;

            return (
              <div
                key={i}
                className="rounded-lg border p-4 bg-slate-50 space-y-3"
              >
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="font-medium">
                    {groupDef.displayName ?? groupName} #{i + 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeGroup(i)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-4">
                  {groupDef.values?.map((f: any) =>
                    shouldDisplayField(f, groupItem[groupName], rootValues) ? (
                      <FieldRenderer
                        key={f.name}
                        prop={f}
                        value={groupItem[groupName][f.name]}
                        onChange={(p: any, v: number) =>
                          updateGroup(i, groupName, f.name, v)
                        }
                        path={[...path, i, groupName, f.name]}
                        allValues={groupItem[groupName]}
                        rootValues={rootValues}
                      />
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {groups.map((g: any) => (
              <Button
                key={g.name}
                variant="outline"
                size="sm"
                onClick={() => addGroup(g.name)}
              >
                + Add {g.displayName ?? g.name}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    case "color":
      return (
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type="color"
            value={value ?? prop.default ?? "#000000"}
            onChange={(e) => set(e.target.value)}
            className="h-10 w-16 p-1 cursor-pointer"
          />
        </div>
      );

    case "dateTime":
      return (
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type="datetime-local"
            value={value ?? prop.default ?? ""}
            onChange={(e: any) => set(e.target.value)}
          />
        </div>
      );

    case "credentialsSelect":
      return (
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            placeholder="Enter credential ID or name"
            value={value ?? ""}
            onChange={(e: any) => set(e.target.value)}
          />
        </div>
      );

    default:
      return <div className="text-red-600">Unsupported type: {prop.type}</div>;
  }
}

// --- Main Editor ---
export default function NodesConfig() {
  const { state, dispatch } = useContext(DataContext);
  const { skill, skillLoading, workflow } = state;
  const skillConfig = skill?.config || [];
  const [values, setValues] = useState<AnyObject>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setValues(computeInitialValues(skillConfig));
  }, []);

  const handleChange = (path: (string | number)[], val: any) => {
    const next = deepClone(values);
    if (path.length === 0) {
      setValues(val ?? {});
      return;
    }
    let cur: any = next;
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i];
      cur[p] = cur[p] ?? {};
      cur = cur[p];
    }
    cur[path[path.length - 1]] = val;
    setValues(next);
  };

  const handleSave = async () => {
    setSaveLoading(true);

    const updatedConfigArray = (skillConfig || []).map((field: any) => {
      const savedValue = values[field.name];
      return {
        ...field,
        value: savedValue,
        default: savedValue,
      };
    });

    const payload = {
      is_active: skill?.is_active,
      config: updatedConfigArray,
      agent_id: id,
    };

    const res = await PutRequest(
      `/agents/workflows/${workflow.workflow_id}/nodes/${skill?.skill_id}`,
      // `/skills/${skill?.skill_id}/agents/${id}`,
      payload
    );
    if (res.status === 200 || res.status === 201) {
      showError(res.data.message);
      onClose();
      setSaveLoading(false);
    } else {
      setSaveLoading(false);
      showError(res.data.message || "Failed to save configuration.");
    }
  };

  const onClose = () => {
    dispatch({ type: ACTIONS.NODE_SIDEBAR, payload: false });
  };

  //

  return (
    <div className="flex flex-col h-full bg-white z-50 overflow-hidden">
      <nav className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Edit Configuration</h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="size-5" />
        </Button>
      </nav>

      {skillLoading ? (
        <div className="flex items-center justify-center mt-20">
          <Loading color="blue" />
        </div>
      ) : (
        <div className="overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300">
          <div className="flex items-center gap-3 p-3 border rounded-lg mb-4">
            <div className="min-w-12 min-h-12 rounded-md flex items-center justify-center bg-[#F1F1FE] border">
              <Image
                src={skill?.icon || images.bot}
                alt="skill"
                width={25}
                height={25}
                unoptimized
                className="h-[25px] w-[25px]"
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{skill?.name}</h4>
              <p className="text-gray-500 text-xs">{skill?.description}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded border space-y-4">
            {skillConfig.length ? (
              skillConfig.map((p: any) =>
                shouldDisplayField(p, values, values) ? (
                  <FieldRenderer
                    key={p.name}
                    prop={p}
                    value={values[p.name]}
                    onChange={handleChange}
                    path={[p.name]}
                    allValues={values}
                    rootValues={values}
                  />
                ) : null
              )
            ) : (
              <div className="text-sm text-muted-foreground">
                No properties defined
              </div>
            )}
          </div>
        </div>
      )}

      {skill?.config && skill?.config.length > 0 && (
        <div className="flex justify-end gap-3 p-4 border-t mt-auto mb-20">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveLoading}
            className="bg-primary-500 px-6 text-white hover:bg-primary-700"
          >
            {saveLoading ? (
              <span className="flex items-center gap-2">
                Saving...
                <Loading width="16" height="16" />
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
