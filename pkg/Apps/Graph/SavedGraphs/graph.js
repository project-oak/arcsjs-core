[
  {
    $meta: { name: "OtherGraph", id: "3738-6430-4657" },
    nodes: {
      SplitPanelNode1: {
        id: "SplitPanelNode1",
        type: "SplitPanelNode",
        displayName: "Split Panel",
        connections: {},
        props: { layout: "vertical", endflex: true },
      },
      CameraNode1: {
        id: "CameraNode1",
        type: "CameraNode",
        displayName: "Camera",
        connections: {},
        props: { fps: 30 },
      },
      MultilineTextFieldNode1: {
        id: "MultilineTextFieldNode1",
        type: "MultilineTextFieldNode",
        displayName: "Multiline Text Field",
        connections: {},
        props: { value: "value" },
      },
      PanelNode1: {
        id: "PanelNode1",
        type: "PanelNode",
        displayName: "Panel",
        connections: {},
        props: {
          layout: "column",
          center: false,
          style: "flex: none; height: 8em; padding: 12px;",
        },
      },
      BooleanFieldNode1: {
        id: "BooleanFieldNode1",
        type: "BooleanFieldNode",
        displayName: "Boolean Field",
        connections: {},
        props: { value: false },
      },
      SelectFieldNode1: {
        id: "SelectFieldNode1",
        type: "SelectFieldNode",
        displayName: "Select Field",
        connections: {},
        props: { value: "", options: [] },
      },
    },
    layout: {
      nodegraph: {},
      preview: {
        "CameraNode1:Container": "SplitPanelNode1:panel#FirstContainer",
        "MultilineTextFieldNode1:Container": "PanelNode1:panel#Container",
        "PanelNode1:Container": "SplitPanelNode1:panel#SecondContainer",
        "BooleanFieldNode1:Container": "PanelNode1:panel#Container",
        "SelectFieldNode1:Container": "PanelNode1:panel#Container",
      },
    },
  },
  {
    $meta: { name: "GraphMaker", id: "8291-2052-6799" },
    nodes: {
      SplitPanelNode1: {
        id: "SplitPanelNode1",
        type: "SplitPanelNode",
        displayName: "Main Panel",
        connections: {},
        props: { layout: "vertical", endflex: true, divider: 212 },
      },
      SplitPanelNode2: {
        id: "SplitPanelNode2",
        type: "SplitPanelNode",
        displayName: "Edit Panel",
        connections: {},
        props: {},
      },
      SplitPanelNode3: {
        id: "SplitPanelNode3",
        type: "SplitPanelNode",
        displayName: "ColumnsPanel",
        connections: {},
        props: { layout: "vertical" },
      },
      SplitPanelNode4: {
        id: "SplitPanelNode4",
        type: "SplitPanelNode",
        displayName: "ToolsPanel",
        connections: {},
        props: {},
      },
      NodeInspectorNode1: {
        id: "NodeInspectorNode1",
        type: "NodeInspectorNode",
        displayName: "Node Inspector",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      NodeTypesNode2: {
        id: "NodeTypesNode2",
        type: "NodeTypesNode",
        displayName: "Node Types",
        connections: {},
        props: {},
      },
      NodeDesignerNode1: {
        id: "NodeDesignerNode1",
        type: "NodeDesignerNode",
        displayName: "Node Designer",
        connections: {
          selectedGraph: ["GraphToolbarNode1:graph"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
          graph: ["GraphToolbarNode1:graph"],
        },
        props: {},
      },
      NodeEditorNode1: {
        id: "NodeEditorNode1",
        type: "NodeEditorNode",
        displayName: "Node Editor",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      NodeTreeNode1: {
        id: "NodeTreeNode1",
        type: "NodeTreeNode",
        displayName: "Node Tree",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      GraphToolbarNode1: {
        id: "GraphToolbarNode1",
        type: "GraphToolbarNode",
        displayName: "Graph Toolbar",
        connections: {},
        props: {
          graphs: [
            {
              $meta: { name: "embarrassed-low", id: "1815-7401-2264" },
              nodes: {},
            },
          ],
          graph: {
            $meta: { name: "embarrassed-low", id: "1815-7401-2264" },
            nodes: {},
          },
          icons: [
            { icon: "add", title: "New Graph", key: "onNew" },
            { icon: "delete", title: "Delete Graph", key: "onDelete" },
            {
              icon: "content_copy",
              title: "Duplicate Graph",
              key: "onCloneClicked",
            },
          ],
        },
      },
      NodeCreatorNode1: {
        id: "NodeCreatorNode1",
        type: "NodeCreatorNode",
        displayName: "Node Creator",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
          newNodeInfos: ["NodeDesignerNode1:newNodeInfos"],
        },
        props: {},
      },
      NodeCatalogNode1: {
        id: "NodeCatalogNode1",
        type: "NodeCatalogNode",
        displayName: "Node Catalog",
        connections: { nodeTypes: ["NodeTypesNode2:NodeTypes"] },
        props: {},
      },
      SplitPanelNode12394: {
        id: "SplitPanelNode12394",
        type: "SplitPanelNode",
        displayName: "Split Panel 12394",
        connections: {},
        props: { endflex: true, divider: 36 },
      },
    },
    layout: {
      nodegraph: {
        SplitPanelNode1: { l: 27, t: 329, w: 140, h: 116 },
        SplitPanelNode2: { l: 68, t: 352, w: 140, h: 116 },
        SplitPanelNode3: { l: 29, t: 321, w: 140, h: 116 },
        SplitPanelNode4: { l: 12, t: 342, w: 140, h: 116 },
        NodeInspectorNode1: { l: 435, t: 121, w: 140, h: 136 },
        NodeTypesNode2: { l: 18, t: 204, w: 140, h: 60 },
        NodeDesignerNode1: { l: 228, t: 104, w: 140, h: 136 },
        NodeEditorNode1: { l: 231, t: 257, w: 140, h: 156 },
        GraphToolbarNode1: { l: 19, t: 71, w: 140, h: 116 },
        NodeTreeNode1: { l: 433, t: 264, w: 140, h: 116 },
        NodeCreatorNode1: { l: 435, t: 17, w: 140, h: 96 },
        NodeCatalogNode1: { l: 232, t: 16, w: 140, h: 76 },
      },
      preview: {
        "SplitPanelNode2:Container": "SplitPanelNode3:panel#FirstContainer",
        "SplitPanelNode3:Container": "SplitPanelNode1:panel#SecondContainer",
        "SplitPanelNode4:Container": "SplitPanelNode3:panel#SecondContainer",
        "NodeInspectorNode1:Container": "SplitPanelNode4:panel#FirstContainer",
        "NodeDesignerNode1:Container":
          "SplitPanelNode12394:panel#SecondContainer",
        "NodeEditorNode1:Container": "SplitPanelNode2:panel#SecondContainer",
        "NodeTreeNode1:Container": "SplitPanelNode4:panel#SecondContainer",
        "GraphToolbarNode1:Container":
          "SplitPanelNode12394:panel#FirstContainer",
        "NodeCatalogNode1:Container": "SplitPanelNode1:panel#FirstContainer",
        "SplitPanelNode12394:Container": "SplitPanelNode2:panel#FirstContainer",
      },
    },
  },
  {
    $meta: { name: "Copy of GraphMaker", id: "5582-4531-1191" },
    nodes: {
      SplitPanelNode1: {
        id: "SplitPanelNode1",
        type: "SplitPanelNode",
        displayName: "Main Panel",
        connections: {},
        props: { layout: "vertical", endflex: true, divider: 212 },
      },
      SplitPanelNode2: {
        id: "SplitPanelNode2",
        type: "SplitPanelNode",
        displayName: "Edit Panel",
        connections: {},
        props: {},
      },
      SplitPanelNode3: {
        id: "SplitPanelNode3",
        type: "SplitPanelNode",
        displayName: "ColumnsPanel",
        connections: {},
        props: { layout: "vertical" },
      },
      SplitPanelNode4: {
        id: "SplitPanelNode4",
        type: "SplitPanelNode",
        displayName: "ToolsPanel",
        connections: {},
        props: {},
      },
      NodeInspectorNode1: {
        id: "NodeInspectorNode1",
        type: "NodeInspectorNode",
        displayName: "Node Inspector",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      NodeTypesNode2: {
        id: "NodeTypesNode2",
        type: "NodeTypesNode",
        displayName: "Node Types",
        connections: {},
        props: {},
      },
      NodeDesignerNode1: {
        id: "NodeDesignerNode1",
        type: "NodeDesignerNode",
        displayName: "Node Designer",
        connections: {
          selectedGraph: ["GraphToolbarNode1:graph"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
          graph: ["GraphToolbarNode1:graph"],
        },
        props: {},
      },
      NodeEditorNode1: {
        id: "NodeEditorNode1",
        type: "NodeEditorNode",
        displayName: "Node Editor",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      NodeTreeNode1: {
        id: "NodeTreeNode1",
        type: "NodeTreeNode",
        displayName: "Node Tree",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          selectedNodeId: ["NodeDesignerNode1:selectedNodeId"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
        },
        props: {},
      },
      GraphToolbarNode1: {
        id: "GraphToolbarNode1",
        type: "GraphToolbarNode",
        displayName: "Graph Toolbar",
        connections: {},
        props: {
          graphs: [
            {
              $meta: { name: "embarrassed-low", id: "1815-7401-2264" },
              nodes: {},
            },
          ],
          graph: {
            $meta: { name: "embarrassed-low", id: "1815-7401-2264" },
            nodes: {},
          },
          icons: [
            { icon: "add", title: "New Graph", key: "onNew" },
            { icon: "delete", title: "Delete Graph", key: "onDelete" },
            {
              icon: "content_copy",
              title: "Duplicate Graph",
              key: "onCloneClicked",
            },
          ],
        },
      },
      SplitPanelNode5: {
        id: "SplitPanelNode5",
        type: "SplitPanelNode",
        displayName: "Split Panel 5",
        connections: {},
        props: { endflex: true, divider: 40 },
      },
      NodeCreatorNode1: {
        id: "NodeCreatorNode1",
        type: "NodeCreatorNode",
        displayName: "Node Creator",
        connections: {
          graph: ["GraphToolbarNode1:graph"],
          nodeTypes: ["NodeTypesNode2:NodeTypes"],
          newNodeInfos: ["NodeDesignerNode1:newNodeInfos"],
        },
        props: {},
      },
      NodeCatalogNode1: {
        id: "NodeCatalogNode1",
        type: "NodeCatalogNode",
        displayName: "Node Catalog",
        connections: { nodeTypes: ["NodeTypesNode2:NodeTypes"] },
        props: {},
      },
    },
    position: {},
  },
];