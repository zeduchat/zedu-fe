// "use client";

// import React, { useCallback, useContext, useState, useEffect } from "react";
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   OnNodesChange,
//   OnEdgesChange,
//   OnConnect,
//   Node,
//   Edge,
//   Connection,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import { DataContext } from "~/store/GlobalState";

// interface N8nNode {
//   id: string;
//   name: string;
//   position: [number, number];
//   [key: string]: any;
// }

// interface N8nData {
//   nodes: N8nNode[];
//   connections: Record<string, { main: { node: string }[][] }>;
//   [key: string]: any;
// }

// interface WorkflowState {
//   workflow: {
//     raw_entry?: string | N8nData;
//   };
// }

// const toFlowFormat = (
//   n8nData: N8nData | null
// ): { nodes: Node[]; edges: Edge[] } => {
//   if (!n8nData || !n8nData.nodes || !n8nData.connections) {
//     return { nodes: [], edges: [] };
//   }

//   const nodes: Node[] = n8nData.nodes.map((n: N8nNode) => ({
//     id: n.id,
//     data: { label: n.name },
//     position: { x: n.position[0], y: n.position[1] },
//     type: "default",
//   }));

//   const edges: any = Object.keys(n8nData.connections).flatMap((sourceName) => {
//     const sourceNode = nodes?.find((n) => n.data.label === sourceName);
//     if (!sourceNode) return [];

//     const connectionGroups = n8nData.connections[sourceName].main;
//     return connectionGroups
//       .flatMap((targetGroup) =>
//         targetGroup.map((targetInfo) => {
//           const targetNode = nodes?.find(
//             (n) => n.data.label === targetInfo.node
//           );
//           if (!targetNode) return null;

//           return {
//             id: `e-${sourceNode.id}-${targetNode.id}`,
//             source: sourceNode.id,
//             target: targetNode.id,
//             type: "smoothstep",
//           };
//         })
//       )
//       .filter((edge: any) => edge !== null);
//   });

//   return { nodes, edges };
// };

// export default function NodesEditor() {
//   const { state } = useContext(DataContext) as { state: WorkflowState };
//   const { workflow: json } = state;

//   const [workflow, setWorkflow] = useState<N8nData | null>(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesState] = useEdgesState([]);

//   useEffect(() => {
//     let workflowData: N8nData | null = null;
//     const rawEntry = json?.raw_entry;

//     if (typeof rawEntry === "string") {
//       try {
//         workflowData = JSON.parse(rawEntry);
//       } catch (e) {
//         console.error("Failed to parse raw_entry string:", e);
//       }
//     } else if (typeof rawEntry === "object" && rawEntry !== null) {
//       workflowData = rawEntry as N8nData;
//     }

//     if (workflowData) {
//       setWorkflow(workflowData);
//       const { nodes: newNodes, edges: newEdges } = toFlowFormat(workflowData);
//       setNodes(newNodes);
//       setEdges(newEdges);
//     }
//   }, [json, setNodes, setEdges]);

//   const onConnect: OnConnect = useCallback(
//     (params: Connection) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   if (!workflow) {
//     return (
//       <div className="flex w-full h-[500px] items-center justify-center text-gray-500">
//         No valid workflow data found.
//       </div>
//     );
//   }

//   return (
//     <div className="flex w-full h-[500px]">
//       <div className="flex-1 relative">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange as OnNodesChange}
//           onEdgesChange={onEdgesState as OnEdgesChange}
//           onConnect={onConnect}
//           fitView
//           proOptions={{ hideAttribution: true }}
//         >
//           <MiniMap />
//           <Controls />
//           <Background />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }

"use client";

import { useParams } from "next/navigation";
import React, {
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import NodesConfig from "./node-config";

interface N8nNode {
  id: string;
  name: string;
  position: [number, number];
  parameters: Record<string, any>;
  type: string;
  [key: string]: any;
}

interface N8nData {
  nodes: N8nNode[];
  connections: Record<string, { main: { node: string }[][] }>;
  [key: string]: any;
}

const toFlowFormat = (
  n8nData: N8nData | null
): { nodes: Node[]; edges: Edge[] } => {
  if (!n8nData || !n8nData.nodes || !n8nData.connections) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = n8nData.nodes.map((n: N8nNode) => ({
    id: n.id,
    data: {
      label: n.name,
      n8nNode: n,
    },
    position: { x: n.position?.[0] ?? 0, y: n.position?.[1] ?? 0 },
    // position: { x: n.position[0], y: n.position[1] },
    type: "default",
  }));

  const edges: any = Object.keys(n8nData.connections).flatMap((sourceName) => {
    const sourceNode = nodes?.find((n) => n.data.label === sourceName);
    if (!sourceNode) return [];

    const connectionGroups = n8nData.connections[sourceName].main;
    return connectionGroups
      .flatMap((targetGroup) =>
        targetGroup.map((targetInfo) => {
          const targetNode = nodes?.find(
            (n) => n.data.label === targetInfo.node
          );
          if (!targetNode) return null;

          return {
            id: `e-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: "smoothstep",
          };
        })
      )
      .filter((edge: any) => edge !== null);
  });

  return { nodes, edges };
};

export default function NodesEditor() {
  const { state, dispatch } = useContext(DataContext);
  const { workflow: json } = state;
  const { id: agentId } = useParams();

  const [workflow, setWorkflow] = useState<N8nData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesState] = useEdgesState([]);

  useEffect(() => {
    let workflowData: N8nData | null = null;
    const rawEntry = json?.raw_entry;

    if (typeof rawEntry === "string") {
      try {
        workflowData = JSON.parse(rawEntry);
      } catch (e) {
        console.error("Failed to parse raw_entry string:", e);
      }
    } else if (typeof rawEntry === "object" && rawEntry !== null) {
      workflowData = rawEntry as N8nData;
    }

    if (workflowData) {
      setWorkflow(workflowData);
      const { nodes: newNodes, edges: newEdges } = toFlowFormat(workflowData);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [json, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    const n8nNodeData = node.data.n8nNode;
    handleOpen(n8nNodeData.skill_id);
  }, []);

  const handleOpen = async (nodeId: string) => {
    dispatch({ type: ACTIONS.SKILL_LOADING, payload: true });
    dispatch({ type: ACTIONS.NODE_SIDEBAR, payload: true });

    const res = await GetRequest(`/skills/${nodeId}/agents/${agentId}`);
    if (res.status === 200 || res.status === 201) {
      dispatch({ type: ACTIONS.SKILL, payload: res.data.data });
    }

    dispatch({ type: ACTIONS.SKILL_LOADING, payload: false });
  };

  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  if (!workflow) {
    return (
      <div className="flex w-full h-[500px] items-center justify-center text-gray-500">
        No valid workflow data found.
      </div>
    );
  }

  return (
    <div className="flex w-full h-[500px] relative">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange as OnNodesChange}
          onEdgesChange={onEdgesState as OnEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {state?.nodeSidebar && (
        <div
          className={`fixed mt-[60px] right-0 top-0 w-full sm:w-[450px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_25px_0px_#DFDFDF] ${state?.nodeSidebar ? "translate-x-0" : "translate-x-full"}`}
        >
          <NodesConfig />
        </div>
      )}
    </div>
  );
}
