"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { exampleJson } from "~/data/workflow-example";
import { PostRequest, PutRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import Loading from "~/components/ui/loading";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showError, showInfo, showSuccess } from "~/components/toast/sonner";

/** Props */
type Props = {
  initialValue?: string;
  filename?: string;
};

export default function JSONEditor({ filename = "sample.json" }: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const markersDisposableRef = useRef<any>(null);
  const [value, setValue] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [diagnosticsCount, setDiagnosticsCount] = useState<number>(0);
  const { id } = useParams();
  const [saveLoading, setSaveLoading] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { workflow } = state;

  // Use a single useEffect to handle initial value setting
  useEffect(() => {
    // Set a default string value
    let jsonString = '{\n  "text": "Paste your json here"\n}';

    if (
      workflow &&
      typeof workflow.raw_entry === "object" &&
      workflow.raw_entry !== null
    ) {
      try {
        jsonString = JSON.stringify(workflow.raw_entry, null, 2);
      } catch (error) {
        console.error("Failed to stringify workflow.raw_entry:", error);

        jsonString = '{\n  "error": "Could not parse the workflow JSON."\n}';
      }
    }

    setValue(jsonString);
    safeSetModelText(jsonString);
  }, [workflow]);

  // Helper: safely push text into Monaco model if available
  const safeSetModelText = (text: string) => {
    try {
      const model = editorRef.current?.getModel?.();
      if (model && typeof model.pushEditOperations === "function") {
        // Ensure a valid range to replace the entire content
        const fullRange = model.getFullModelRange();
        model.pushEditOperations([], [{ range: fullRange, text }], () => null);
      } else {
        // Fallback to simple state update if Monaco model not available
        setValue(text);
      }
    } catch (e) {
      // last resort
      setValue(text);
    }
  };

  const updateDiagnosticsForModel = useCallback((model: any, monaco: any) => {
    if (!model || !monaco) return;
    try {
      const modelMarkers = monaco.editor.getModelMarkers({
        resource: model.uri,
      });
      setDiagnosticsCount(modelMarkers.length);
      setIsValid(modelMarkers.length === 0);
    } catch (e) {
      // If something goes wrong while checking markers, mark as invalid conservatively
      setDiagnosticsCount(0);
      setIsValid(true);
    }
  }, []);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Ensure JSON mode
      const model = editor.getModel?.();
      if (model) {
        try {
          monaco.editor.setModelLanguage(model, "json");
        } catch (e) {
          // ignore
        }

        // Initial diagnostics check
        updateDiagnosticsForModel(model, monaco);

        try {
          // onDidChangeMarkers returns a disposable in Monaco
          markersDisposableRef.current = monaco.editor.onDidChangeMarkers(
            () => {
              updateDiagnosticsForModel(model, monaco);
            }
          );
        } catch (e) {
          // ignore
        }
      }

      // The value prop on Editor will handle this, so no need for this line
      // safeSetModelText(value);
    },
    [updateDiagnosticsForModel]
  );

  useEffect(() => {
    return () => {
      try {
        if (
          markersDisposableRef.current &&
          typeof markersDisposableRef.current.dispose === "function"
        ) {
          markersDisposableRef.current.dispose();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleChange = (val: string | undefined) => {
    setValue(val ?? "");
  };

  const prettify = async () => {
    try {
      const parsed = JSON.parse(value);
      const pretty = JSON.stringify(parsed, null, 2);
      setValue(pretty);
      safeSetModelText(pretty);

      // Try to run Monaco format action (if available)
      try {
        if (editorRef.current?.getAction) {
          const action = editorRef.current.getAction(
            "editor.action.formatDocument"
          );
          if (action && typeof action.run === "function") action.run();
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // invalid JSON — Monaco will display inline diagnostics if available
      console.warn("Prettify failed: invalid JSON");
    }
  };

  const compress = () => {
    try {
      const parsed = JSON.parse(value);
      const minified = JSON.stringify(parsed);
      setValue(minified);
      safeSetModelText(minified);
    } catch (e) {
      console.warn("Compress failed: invalid JSON");
    }
  };

  const handleSave = async () => {
    if (!isValid) {
      if (!confirm("JSON has errors. Save anyway?")) return;
    }

    setSaveLoading(true);

    try {
      const parsedJson = JSON.parse(value);

      const payload = {
        name: "Default Workflow",
        raw_entry: parsedJson,
      };

      const res = await PostRequest(`/agents/${id}/workflows`, payload);
      if (res.status === 200 || res.status == 201) {
        dispatch({
          type: ACTIONS.TASKS_CALLBACK,
          payload: !state.tasksCallback,
        });
        showSuccess(res.data.message);
      }
    } catch (error) {
      showError("Failed to parse JSON or save workflow.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!isValid) {
      if (!confirm("JSON has errors. Save anyway?")) return;
    }

    setSaveLoading(true);

    try {
      const parsedJson = JSON.parse(value);

      const payload = {
        name: "Default Workflow",
        raw_entry: parsedJson,
        is_active: true,
      };

      const res = await PutRequest(
        `/agents/${id}/workflows/${workflow.workflow_id}`,
        payload
      );
      if (res.status === 200 || res.status == 201) {
        dispatch({
          type: ACTIONS.TASKS_CALLBACK,
          payload: !state.tasksCallback,
        });
        showSuccess(res.data.message);
      }
    } catch (error) {
      showError("Failed to parse JSON or update workflow.");
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showInfo("Copied to clipboard");
    } catch (e) {
      showError("Copy failed");
    }
  };

  const insertExample = () => {
    setValue(exampleJson);
    safeSetModelText(exampleJson);
  };

  //

  return (
    <div className="w-full mt-10 h-[80vh] max-h-[900px] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-md p-4 flex flex-col gap-3 overflow-x-auto">
      <div className="flex items-center justify-between gap-3 w-[900px] md:w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Paste Workflow JSON</h2>
          <div
            className={`ml-3 px-2 text-xs rounded-full font-medium ${isValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
          >
            {isValid ? "Valid JSON" : `Errors: ${diagnosticsCount}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={insertExample}
            className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100"
          >
            Example
          </button>
          <button
            onClick={prettify}
            className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100"
          >
            Prettify
          </button>
          <button
            onClick={compress}
            className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100"
          >
            Compress
          </button>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 rounded-md border text-sm hover:bg-slate-100"
          >
            Copy
          </button>
          {!workflow ? (
            <button
              disabled={!isValid}
              onClick={handleSave}
              className={`px-3 py-1 rounded-md text-white text-sm flex items-center gap-1 
    ${!isValid ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-blue-600 hover:opacity-90"}`}
            >
              Save {saveLoading && <Loading height="10" width="10" />}
            </button>
          ) : (
            <button
              disabled={!isValid}
              onClick={handleEdit}
              className={`px-3 py-1 rounded-md text-white text-sm flex items-center gap-1 
    ${!isValid ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-blue-600 hover:opacity-90"}`}
            >
              Update {saveLoading && <Loading height="10" width="10" />}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onMount={handleEditorMount}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            formatOnPaste: true,
            formatOnType: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Filename: <span className="ml-1 font-medium">{filename}</span>
        </div>
      </div>
    </div>
  );
}
