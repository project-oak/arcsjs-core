/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';
import {d3} from './d3-import.js';

export function snap1d(x, snap = 16) {
  return Math.round(x / snap) * snap;
}

function snapPosition({x, y}, snap = 16) {
  return {x: snap1d(x, snap), y: snap1d(y, snap)};
}

const template = Xen.Template.html`
<style>
  :host {
    width: 100%;
  }

  .container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  svg {
    width: 100%;
    height: 100%;
    user-select: none;
    cursor: grab;
  }

  svg.dragging-tmp-edge {
    cursor: pointer;
  }

  svg.panning {
    cursor: grabbing;
  }

  rect.pattern {
    pointer-events: none;
  }

  g.edge,
  g.node {
    cursor: pointer;
  }

  rect.node {
    stroke-opacity: .5;
  }

  rect.node-hovered {
    fill: rgba(0, 0, 0, .04);
    display: none;
  }

  g.node.hovered rect.node-hovered {
    display: block;
  }

  rect.node-ui-indicator {
    display: none;
  }

  g.node.has-ui rect.node-ui-indicator {
    display: block;
  }

  g.node.has-ui .node-label-container {
    padding-top: 10px;
  }

  .node-label-container {
    font-weight: 500;
    font-size: 14px;
    user-select: none;
    padding: 4px;
    box-sizing: border-box;
  }

  .visibility-icon {
    display: none;
  }

  g.node.hidden-ui .visibility-icon {
    display: block;
  }

  .node-label {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 100%;
    padding: 6px;
    line-height: 15px;
    text-align: center;
    text-transform: capitalize;
    overflow: hidden;
  }

  .node-label:focus {
    text-transform: none;
    background-color: rgba(0, 0, 0, .3);
  }

  .node-label.has-custom-name {
    text-transform: none;
  }

  path.port,
  circle.port {
    pointer-events: none;
    stroke-width: 1.5;
  }

  path.port-bg {
    fill: transparent;
    stroke: none;
  }

  g.node.no-matching-input,
  circle.port.not-matching-tmp-edge,
  path.port.not-matching-tmp-edge {
    opacity: .3;
  }

  circle.port,
  path.port,
  g.node {
    transition: opacity 200ms;
  }

  .port-bg.output {
    fill: transparent;
    stroke: none;
    cursor: pointer;
  }

  .port-bg.input {
    fill: transparent;
    stroke: none;
  }

  g.output-port.has-tmp-edge .store-name-container,
  g.output-port:hover .store-name-container {
    opacity: 1;
  }

  g.input-port:hover .store-name-container {
    opacity: 1;
  }

  path.plus {
    pointer-events: none;
  }

  path.tmp-edge {
    pointer-events: none;
    fill: none;
    stroke: #BDC1C6;
    stroke-width: 2;
  }

  .store-name-container {
    height: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms;
  }

  .store-name-container .store-name {
    height: 100%;
    display: flex;
    align-items: center;
    color: #666;
    padding: 0 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, .8);
    box-sizing: border-box;
    width: fit-content;
  }

  .store-name-container.input .store-name {
    float: right;
  }

  .just-connected .store-name-container,
  svg.dragging-tmp-edge .store-name-container {
    opacity: 0 !important;
  }

  g.edge:hover {
    cursor: pointer;
  }

  g.edge:hover path.edge {
    stroke: #80868B;
  }

  g.edge.selected path.edge {
    stroke: #5F6368;
    stroke-width: 3px;
  }

  path.edge {
    pointer-events: none;
    fill: none;
    stroke: #BDC1C6;
    stroke-width: 2;
  }

  path.edge-bg {
    fill: none;
    stroke: transparent;
    stroke-width: 15;
  }

  icon {
    font-family: "Material Icons";
    font-style: normal;
    -webkit-font-feature-settings: "liga";
    font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    user-select: none;
    flex-shrink: 0;
    vertical-align: middle;
    overflow: hidden;
    pointer-events: none;
    align-items: center;
    font-size: 14px;
  }

  .node-icons-container {
    color: #aaa;
  }

  [toolbar] {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 2px 8px;
    border-radius: 4px;
    position: absolute;
    box-shadow: 0 1px 2px rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
    top: 8px;
    left: 8px;
    color: #777;
    user-select: none;
    background-color: white;
    overflow: hidden;
    max-width: 14px;
    transition: max-width 150ms ease-in-out;
  }

  [toolbar]:hover {
    max-width: 220px;
  }

  [toolbar-item] {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 24px;
  }

  [toolbar-item-label] {
    color: #555;
    margin-left: 8px;
    width: 90px;
  }

  [toolbar-item]:hover [toolbar-item-label] {
    color: #333;
  }

  [toolbar-item][delete]:hover [toolbar-item-label],
  [toolbar-item][delete]:hover icon {
    color: #aa0000;
  }

  [toolbar-item-shortcut] {
    color: #999;
    margin-left: 4px;
    overflow: hidden;
    white-space: nowrap;
  }

  [candidate-chooser-backdrop] {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background-color: transparent;
    z-index: 1000;
  }

  [candidate-chooser-dialog] {
    display: flex;
    flex-direction: column;
    width: 200px;
    max-height: 220px;
    position: absolute;
    background: white;
    box-shadow: 0px 1px 2px rgba(60, 64, 67, 0.3), 0px 2px 6px 2px rgba(60, 64, 67, 0.15);
    top: 200px;
    left: 200px;
    border-radius: 8px;
    overflow: hidden;
  }

  [candidate-chooser-dialog-title] {
    font-weight: 500;
    padding: 4px 8px;
    height: 24px;
    line-height: 24px;
    border-bottom: 1px solid #ccc;
  }

  [candidate-chooser-dialog-content] {
    overflow-y: auto;
  }

  .candidate-group {
    display: flex;
    flex-direction: column;
  }

  .group-container {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 24px;
    background-color: #eee;
    font-weight: 500;
    color: #333;
    position: sticky;
    top: 0;
  }

  .group-name {
    margin-left: 6px;
    text-transform: capitalize;
  }

  .node-type {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 28px;
    color: #333;
    cursor: pointer;
    text-transform: capitalize;
  }

  .node-type:hover {
    background-color: #f5f5f5;
  }

  .hide {
    display: none;
  }
</style>

<div class="container"
     on-dragover="onDragOver"
     on-drop="onDrop">
  <svg>
    <!-- A shadow, shown when a node is selected -->
    <filter id="node-dropshadow" height="140%">
      <feGaussianBlur result="blurout" in="SourceAlpha" stdDeviation="3"/>
      <!-- matrix color transform to achieve #4285f4 (G-blue-500) -->
      <feColorMatrix result="matrixOut" in="blurout" type="matrix" values="0 0 0 0 .5216  0 0 0 0 .5216  0 0 0 0 .5216  0 0 0 1 0"/>
      <feOffset dx="0" dy="3" result="offsetblur"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>/edge
    </filter>

    <defs>
      <pattern id='a' patternUnits='userSpaceOnUse' width='64' height='64' patternTransform='translate(-32,-48) scale(0.25) rotate(0)'>
        <rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/>
        <path d='M11 6a5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5' stroke-width='1' stroke='none' fill='hsla(258.5,59.4%,59.4%,0.1)'/>
      </pattern>

      <clipPath id="ui-indicator-clippath">
        <rect width="147" height="16" rx="8"/>
      </clipPath>
    </defs>

    <g class="zoom-target">
      <rect class="pattern" x='-400%' y='-2000%' width='800%' height='8000%' transform='translate(0,0)' fill='url(#a)'/>
      <g class="content">
        <g class="tmp-edge-container"></g>
        <g class="edges-container"></g>
        <g class="nodes-container"></g>
      </g>
    </g>
  </svg>

  <div toolbar>
    <!-- Delete selected nodes or edge -->
    <div toolbar-item delete on-click="onClickDeleteNodesOrEdge">
      <icon>delete</icon>
      <div toolbar-item-label delete>Delete</div>
      <div toolbar-item-shortcut>DEL or ⌫</div>
    </div>

    <!-- Duplicate -->
    <div toolbar-item duplicate on-click="onClickDuplicateNodes">
      <icon>content_copy</icon>
      <div toolbar-item-label duplicate>Duplicate</div>
      <div toolbar-item-shortcut duplicate>{{duplicateShortcut}}</div>
    </div>

    <!-- Rename -->
    <div toolbar-item rename on-click="renameNode">
      <icon>drive_file_rename_outline</icon>
      <div toolbar-item-label rename>Rename</div>
      <div toolbar-item-shortcut rename>⏎ or double-click</div>
    </div>
  </div>
</div>

<div candidate-chooser-backdrop class="hide"
     on-click="onClickCandidateChooserBackdrop">
  <div candidate-chooser-dialog>
    <div candidate-chooser-dialog-title>
      Candidates
    </div>
    <div candidate-chooser-dialog-content>
    </div>
  </div>
</div>

`;

const NODE_WIDTH = 147;
const NODE_RX = 8;
const NODE_TOP_BOTTOM_PADDING = 13.5;
const OUTOUT_PORT_RADIUS = 5;
const PORT_ROW_HEIGHT = 24;
const PORT_MOUSE_RADIUS = PORT_ROW_HEIGHT / 2;
const IO_STORE_TYPE_LABEL_WIDTH = 240;
// https://codepen.io/branneman/pen/eYpYdR
const ROUNDED_CORNER_TRIANGLE_PATH = `M 6.7 1.14
  l 2.8 4.7
  s 1.3 3 -1.82 3.22
  l -5.4 0
  s -3.28 -.14 -1.74 -3.26
  l 2.76 -4.7
  s 1.7 -2.3 3.4 0
  z`;

/**
 * An interactive node graph editor with the following features:
 *
 * - Accpets nodes dragged from node catalog.
 * - Users can pan (drag with mouse) and zoom (scroll up and down, or
 *   ctrl+scrollwheel) the graph.
 * - Users can move nodes by dragging them around.
 * - Nodes can be connected by dragging an edge from one node's output port to
 *   another node's matching input port.
 *   TODO(jingjin): Support reconnect edge from one node/port to another.
 * - Users can delete a node/edge by selecting it then pressing the "delete" or
 *   "backspace" key.
 *   TODO(jingjin): Support deleting an edge by dragging an endpoint away from
 *                  its connected port.
 *
 * The rendering is mostly done using d3.
 *
 * Attributes:
 *   - graph: {name, graphNodes}.
 *
 * Events:
 *   - on-nodetype-dropped
 *   - on-node-moved
 *   - on-node-selected
 *   - on-node-deleted
 *   - on-node-renamed
 *   - on-nodes-duplicated
 *   - on-edge-deleted
 *   - on-edge-connected
 */
export class NodeGraphEditor extends Xen.Async {
  static get observedAttributes() {
    return ['graph'];
  }

  get template() {
    return template;
  }

  async _didMount() {
    this.state.svg = this._dom.$('svg');
    this.state.candidateChooserBackdrop =
        this._dom.$('[candidate-chooser-backdrop]');
    this.state.candidateChooserDialog =
        this._dom.$('[candidate-chooser-dialog]');
    this.state.candidateChooserDialogContent =
        this._dom.$('[candidate-chooser-dialog-content]');

    // tmpEdge is the edge that user drags out from an output port *without*
    // connecting it to an input port. It is rendered as a dashed path.
    //
    // The array here will only store data for one tmp edge. Using array is
    // convenient to render it in d3.
    this.state.tmpEdge = [];

    // Tracks all selected nodes in the graph.
    //
    // We allow users to select multiple nodes in the node graph editor by
    // holding down the shift key while selecting a node. Their node keys are
    // stored here. Even we allow multi-selection in the node editor, however,
    // we only (for now) send out the "main" selected node through event to
    // store (that runner and inspector operates on). The "main" selected node
    // is the one that users select WITHOUT holding down the shift key. To
    // distinguish them, the main selected node will be rendered with the solid
    // dark background, and the rest of the selected nodes will be rendered with
    // a thick border.
    //
    // TODO(jingjin): make multi-selection work in the other components of the
    // system.
    this.state.localSelectedNodeKeys = [];

    // Setup pan & zoom.
    this.setupPanAndZoom();

    // Clicking on empty space will deselect any selected node or edge.
    const svg = d3.select(this.state.svg);
    svg.on('click', (event) => {
      if (event.target === this.state.svg) {
        this.updateSelectedNode(undefined);
        this.updateSelectedEdge('');
      }
    });

    // Setup keyboard shortcuts.
    this.setupKeyboardShortcuts();
  }

  render({graph}, state) {
    state.connectableCandidates = graph?.connectableCandidates;

    // Reset state.firstRendered when pipeline changes.
    //
    // state.firstRendered is used later to control to zoom/pan the content to
    // fit the viewport after the first render is done.
    if (state.pipelineName !== graph.name) {
      state.firstRendered = false;
      state.pipelineName = graph.name;
    }

    // Use the keys stored in input (if set) as the current selection.
    if (graph && graph.localSelectedNodeKeys) {
      state.localSelectedNodeKeys = [...graph.localSelectedNodeKeys];
    }

    // Render nodes.
    if (graph?.graphNodes) {
      let curSelectedNodeKey;
      state.graphNodes = [...graph.graphNodes];
      state.graphNodesMap = {};
      state.graphNodes?.forEach(node => {
        if (node.selected) {
          curSelectedNodeKey = node.key;
        }
        state.graphNodesMap[node.key] = node;
      });
      // Clear selection if no node is selected.
      if (!curSelectedNodeKey) {
        this.state.localSelectedNodeKeys = [];
      }
      // Reset selection if current main selected node is not in it.
      else if (!this.state.localSelectedNodeKeys.includes(curSelectedNodeKey)) {
        this.state.localSelectedNodeKeys = [curSelectedNodeKey];
      }
      this.renderNodes();
      // Render edges.
      state.graphEdges = [];
      for (const node of state.graphNodes) {
        state.graphEdges.push(...node.conns);
      }
      this.renderEdges();
    }

    // Pan/zoom the content to fit the viewport on first render.
    if (!this.state.firstRendered) {
      // Reset zoom.
      d3.select(this.state.svg)
          .call(this.state.zoom.transform, d3.zoomIdentity);
      this.fitNodeGraphToView(40, 0);  // 0.9, 0);
      this.state.firstRendered = true;
    }

    this.updateToolbar();

    const isMac = window.navigator &&
        window.navigator.userAgentData.platform.toLowerCase().includes('mac');
    return {duplicateShortcut: isMac ? '⌘D' : 'Ctrl+D'};
  }

  setupPanAndZoom() {
    const svg = d3.select(this.state.svg);
    const g = svg.select('g.zoom-target');
    this.state.zoom = d3.zoom();
    this.state.curZoomFactor = 1;
    this.state.curTranslateX = 0;
    this.state.curTranslateY = 0;

    this.state.zoom.scaleExtent([0.1, 10])
        .on('zoom',
            (e) => {
              this.state.curZoomFactor = e.transform.k;
              this.state.curTranslateX = e.transform.x;
              this.state.curTranslateY = e.transform.y;
              g.attr('transform', e.transform);
            })
        .on('start',
            (e) => {
              if (e.sourceEvent && e.sourceEvent.type === 'mousedown') {
                svg.classed('panning', true);
              }
            })
        .on('end', (e) => {
          if (e.sourceEvent && e.sourceEvent.type === 'mouseup') {
            svg.classed('panning', false);
          }
        });
    svg.call(this.state.zoom);
  }

  updateSelectedNode(node, shift = false) {
    // Select without holding down the shift key.
    if (!shift) {
      // When user is renaming a node then clicks another node, the selection
      // event (here) happens before the renaming event (fired when the node
      // label input is blurred). In this case, we need to fire the renaming
      // event first to correctly update the node label.
      //
      // state.focusedNodeLabel stores the data needed to fire the renaming
      // event. It is set in "renameNode" below.
      if (this.state.focusedNodeLabel) {
        this.key = this.state.focusedNodeLabel.nodeKey;
        this.value = this.state.focusedNodeLabel.nodeLabelEle.textContent;
        this.fire('node-renamed');
      }
      // For now, only send the node that is selected without holding down the
      // shift key to the store as the main selected node.
      this.key = node?.key || '';
      this.fire('node-selected');

      // Clear selection when deselecting all (node=null).
      if (!node) {
        this.state.localSelectedNodeKeys = [];
      }
      // Reset collection when user clicks outside the current selection.
      else if (!this.state.localSelectedNodeKeys.includes(node.key)) {
        this.state.localSelectedNodeKeys = [this.key];
      }
    }
    // When holding down the shift key...
    else {
      // Remove the node from the selection if it already exists.
      const index = this.state.localSelectedNodeKeys.indexOf(node.key);
      if (index >= 0) {
        this.state.localSelectedNodeKeys.splice(index, 1);
      }
      // Otherwise, add it to the selection.
      else {
        this.state.localSelectedNodeKeys.push(node.key);
      }
      // If shift-clicking on the main selected node, deselect it, and use
      // the first shift-selected node as the main selected node if existed.
      if (node.selected) {
        this.key = '';
        if (this.state.localSelectedNodeKeys.length > 0) {
          this.key = this.state.localSelectedNodeKeys[0];
        }
        this.fire('node-selected');
      }
      // If after shift-clicking there is only one node selected, treat it as
      // the main selected node.
      if (this.state.localSelectedNodeKeys.length === 1) {
        this.key = node.key;
        this.fire('node-selected');
      }
      this.renderNodes();
    }
    this.updateToolbar();
  }

  updateSelectedEdge(edgeId) {
    this.state.selectedEdgeId = edgeId;
    this.renderEdges();
    if (edgeId) {
      this.key = '';
      this.fire('node-selected');
    }

    this.updateToolbar();
  }

  updateToolbar() {
    // Only show toolbar when something is selected.
    const toolbar = this._dom.$('[toolbar]');
    const numSelectedNodes = this.state.localSelectedNodeKeys.length;
    const edgeSelected =
        this.state.selectedEdgeId != '' && this.state.selectedEdgeId != null;
    if (numSelectedNodes === 0 && !edgeSelected) {
      toolbar.classList.add('hide');
    } else {
      toolbar.classList.remove('hide');
    }

    // Only show the duplicate button when some nodes are selected.
    const btnDuplicate = this._dom.$('[toolbar-item][duplicate]');
    if (edgeSelected) {
      this.state.enableDuplicate = false;
      btnDuplicate.classList.add('hide');
    } else {
      this.state.enableDuplicate = true;
      btnDuplicate.classList.remove('hide');
    }

    // Only show the rename button when a single node is selected.
    const btnRename = this._dom.$('[toolbar-item][rename]');
    if (edgeSelected || numSelectedNodes !== 1) {
      btnRename.classList.add('hide');
    } else {
      btnRename.classList.remove('hide');
    }

    // Update label for the delete button.
    let label = 'Delete';
    if (edgeSelected) {
      label = 'Delete edge';
    } else {
      if (numSelectedNodes > 1) {
        label = `Delete ${numSelectedNodes} nodes`;
      } else {
        label = 'Delete node';
      }
    }
    this._dom.$('[toolbar-item-label][delete]').textContent = label;
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Don't trigger if any input elements have the focus.
      const activeEle = this.getActiveElement(document);
      const isInputElement = activeEle.tagName === 'INPUT' ||
          activeEle.tagName === 'SELECT' || activeEle.tagName === 'TEXTAREA' ||
          activeEle.contentEditable === 'true';
      if (isInputElement) {
        return;
      }

      // Delete the selected node or edge when pressing the "backspace" or
      // "delete" key .
      if (event.key === 'Backspace' || event.key === 'Delete') {
        this.deleteSelectedNodes();
        this.deleteSelectedEdges();
      }

      // Duplicate.
      if (event.key === 'd' && this.state.enableDuplicate &&
          (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        this.onClickDuplicateNodes();
      }

      // Rename when pressing enter.
      if (event.key === 'Enter') {
        this.renameNode();
      }
    });
  }

  getActiveElement(root) {
    const activeEl = root.activeElement;

    if (!activeEl) {
      return null;
    }

    if (activeEl.shadowRoot) {
      return this.getActiveElement(activeEl.shadowRoot);
    } else {
      return activeEl;
    }
  }

  deleteSelectedNodes() {
    if (this.state.localSelectedNodeKeys.length > 0) {
      this.state.localSelectedNodeKeys.forEach(key => {
        this.key = key;
        this.fire('node-deleted');
      });
    }
  }

  deleteSelectedEdges() {
    if (this.state.selectedEdgeId) {
      this.key = this.state.selectedEdgeId;
      this.fire('edge-deleted');
    }
  }

  renameNode() {
    const nodeKey = this.key;
    const nodeLabel = this._dom.$('g.node.selected .node-label');

    // Store the data that will be used when user selects another node.
    // See comments in "updateSelectedNode" above.
    this.state.focusedNodeLabel = {nodeKey: this.key, nodeLabelEle: nodeLabel};

    // Make the node label editable, and focus on it (with all the text
    // selected). When blurred, make it uneditable and fire event with updated
    // name.
    nodeLabel.setAttribute('contenteditable', 'true');
    nodeLabel.focus();
    nodeLabel.onblur = () => {
      this.state.focusedNodeLabel = undefined;
      nodeLabel.removeAttribute('contenteditable');
      this.key = nodeKey;
      this.value = nodeLabel.textContent;
      this.fire('node-renamed');
      this.fire('node-selected');
    };
    nodeLabel.onkeydown = (e) => {
      // Press enter to blur.
      if (e.key === 'Enter') {
        setTimeout(() => {
          nodeLabel.blur();
        });
      }
    };
    // Select all text in the label.
    setTimeout(() => {
      const range = document.createRange();
      range.selectNodeContents(nodeLabel);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }

  renderNodes() {
    // Bind graph nodes data.
    const nodesContainer =
        d3.select(this.state.svg).select('g.nodes-container');
    const nodesSelection = nodesContainer.selectAll('g.node').data(
        this.state.graphNodes, node => node.key);

    // Render the main elements of the "enter" set of the nodes (i.e. nodes that
    // are newly added to the graph).
    const nodesEnter = this.renderNodeGroup(nodesSelection);
    this.renderNodeBody(nodesEnter);
    this.renderNodeLabel(nodesEnter);
    this.renderNodeHoverOverlay(nodesEnter);
    this.renderUIIndicator(nodesEnter);
    this.renderIcons(nodesEnter);

    // Update node attributs/styles/etc that can be changed by user actions.
    const nodesUpdate = this.updateNodes(nodesEnter, nodesSelection);

    // Remove nodes that no longer exist.
    nodesSelection.exit().remove();

    // Render input and output ports.
    this.renderInputPorts(nodesUpdate);
    this.renderOutputPorts(nodesUpdate);
  }

  /** Renders the <g> element that contains all the elements for a node. */
  renderNodeGroup(nodesSelection) {
    return nodesSelection.enter()
        .append('g')
        .classed('node', true)
        // Clicking the node group will select the node and deselect any
        // selected edge.
        .on('mousedown',
            (event, d) => {
              // Move the selected node to the top.
              d3.select(event.currentTarget).raise();

              this.updateSelectedNode(d, event.shiftKey);
              this.updateSelectedEdge('');
            },
            // Register this event in the "capture" phase so it won't be blocked
            // by any other mousedown events triggered by its child elements.
            true)
        .on('mouseenter',
            (event, d) => {
              this.key = d.key;
              if (!this.state.dragging) {
                this.fire('node-hovered');
              }
            })
        .on('mouseleave',
            (event, d) => {
              this.key = '';
              if (!this.state.dragging) {
                this.fire('node-hovered');
              }
            })
        .on('dblclick', (event) => {
          event.stopPropagation();
          this.renameNode();
        })
        // Dragging the node will update the {x, y} value in the graph node
        // object. Those values will be used in the "update" phase of the d3
        // rendering. See the "updateNode" method below.
        .call(d3.drag()
                  .subject((event, d) => {
                    return {x: d.position.x, y: d.position.y};
                  })
                  .on('start',
                      (event, d) => {
                        this.state.dragging = true;
                        this.state.nodePositionWhenStartDragging = {
                          x: event.x,
                          y: event.y
                        };
                        this.state.shiftSelectedNodeInitialPositions = {};
                        this.state.localSelectedNodeKeys.forEach(key => {
                          const node = this.state.graphNodesMap[key];
                          this.state.shiftSelectedNodeInitialPositions[key] = {
                            x: node.position.x,
                            y: node.position.y,
                          };
                        });
                      })
                  .on('drag',
                      (event, d) => {
                        this.recordPosition(d.key, snapPosition(event));
                        this.renderNodes();
                        this.renderEdges();
                      })
                  // When a node is done moving, fire "node-moved" event, and
                  // the editor will handle the event and update the node
                  // position in the corresponding pipeline node object.
                  .on('end', (event, d) => {
                    this.state.dragging = false;
                    const {x, y} = this.state.nodePositionWhenStartDragging;
                    if (event.x !== x || event.y !== y) {
                      this.state.localSelectedNodeKeys.forEach(key => {
                        this.key = key;
                        this.value = this.state.graphNodesMap[key].position;
                        this.fire('node-moved');
                      });
                    }
                  }));
  }

  recordPosition(key, {x, y}) {
    const dx = x - this.state.nodePositionWhenStartDragging.x;
    const dy = y - this.state.nodePositionWhenStartDragging.y;
    const node = this.state.graphNodesMap?.[key];
    if (node) {
      node.position = {x, y};

      this.state.localSelectedNodeKeys.forEach(key => {
        const curNode = this.state.graphNodesMap?.[key];
        const initialPosition =
            this.state.shiftSelectedNodeInitialPositions[key];
        if (initialPosition) {
          curNode.position = {
            x: initialPosition.x + dx,
            y: initialPosition.y + dy
          };
        }
      });
    }
  }

  renderNodeBody(nodesEnter) {
    nodesEnter.append('rect')
        .classed('node', true)
        .attr('width', NODE_WIDTH)
        .attr('height', d => this.getNodeHeight(d))
        .attr('rx', NODE_RX)
        .attr('stroke', d => d.color);
  }

  renderNodeLabel(nodesEnter) {
    // Use foreignObject to make text layout easier.
    nodesEnter.append('foreignObject')
        .attr('width', NODE_WIDTH)
        .attr('height', d => this.getNodeHeight(d))
        .classed('node-label-container', true)
        .append('xhtml:div')
        .classed('node-label', true);
  }

  renderNodeHoverOverlay(nodesEnter) {
    nodesEnter.append('rect')
        .classed('node-hovered', true)
        .attr('width', NODE_WIDTH)
        .attr('rx', NODE_RX);
  }

  renderUIIndicator(nodesEnter) {
    nodesEnter.append('rect')
        .classed('node-ui-indicator', true)
        .attr('width', NODE_WIDTH)
        .attr('height', 8)
        .attr('clip-path', 'url(#ui-indicator-clippath)');
  }

  renderIcons(nodesEnter) {
    nodesEnter.append('foreignObject')
        .attr('width', NODE_WIDTH)
        .attr('height', 16)
        .attr('y', -16)
        .classed('node-icons-container', true)
        .append('xhtml:icon')
        .classed('visibility-icon', true)
        .text('visibility_off');
  }

  /**
   * Updates attributes of node elements that can be changed by user actions.
   */
  updateNodes(nodesEnter, nodesSelection) {
    const nodesUpdate = nodesEnter.merge(nodesSelection);
    // Dim a node when
    // - User is trying to connect an edge (e.g. tmpEdge exists)
    // - None of its inputs matches the tmpEdge. For example, if user drags a
    //   tmpEdge from a node's "Image" output, then another node's inputs with
    //   "Image" type will match it.
    // - The node is not the source of the tmpEdge.
    nodesUpdate.classed(
        'no-matching-input',
        d => this.hasTmpEdge() && !this.isTmpEdgeFromNode(d) &&
            !this.hasMatchingInputForTmpEdge(d));

    // Update node position using its position value.
    nodesUpdate.attr(
        'transform', d => `translate(${d.position.x}, ${d.position.y})`);

    // Update selection related state/colors.
    nodesUpdate.classed('selected', d => this.isNodeSelectedAsMain(d));
    nodesUpdate.select('rect.node')
        .attr('stroke-width', d => this.isNodeShiftSelected(d) ? 3 : 1)
        .attr('fill', d => this.isNodeSelectedAsMain(d) ? d.color : d.bgColor)
        .attr(
            'filter',
            d => (this.isNodeSelectedAsMain(d) || this.isNodeShiftSelected(d)) ?
                'url(#node-dropshadow)' :
                null);
    nodesUpdate.select('.node-label')
        .style('color', d => this.isNodeSelectedAsMain(d) ? 'white' : d.color)
        .classed(
            'has-custom-name',
            d => d.displayName != null && d.displayName !== '')
        .text(d => d.displayName || d.name);
    nodesUpdate.select('rect').attr('height', d => this.getNodeHeight(d));
    nodesUpdate.select('.node-label-container')
        .attr('height', d => this.getNodeHeight(d));

    // Update hover related state/colors.
    nodesUpdate.classed('hovered', d => d.hovered);
    nodesUpdate.select('rect.node-hovered')
        .attr('height', d => this.getNodeHeight(d));

    // Update ui indicator.
    nodesUpdate.classed('has-ui', d => d.hasUI);
    nodesUpdate.classed('hidden-ui', d => d.hiddenUI);
    nodesUpdate.select('rect.node-ui-indicator')
        .attr('fill', d => (this.isNodeSelectedAsMain(d) ? d.bgColor : d.color))
        .attr('fill-opacity', d => (this.isNodeSelectedAsMain(d) ? 0.7 : 0.4));

    return nodesUpdate;
  }

  renderInputPorts(nodesUpdate) {
    // Bind data.
    const inputPortsSelection = nodesUpdate.selectAll('g.input-port')
                                    .data(d => d.inputs.map((input, index) => {
                                      return {...input, index, node: d};
                                    }));
    const inputPortsEnter =
        inputPortsSelection.enter().append('g').classed('input-port', true);

    // A rect that covers an extended area around the actual input port that
    // reacts to mouse events. This is to make it easier for users to interact
    // with the port.
    inputPortsEnter.append('rect')
        .classed('port-bg input', true)
        .attr('x', -PORT_MOUSE_RADIUS)
        .attr('y', (d, i) => this.getPortY(i) - PORT_MOUSE_RADIUS)
        .attr('width', PORT_MOUSE_RADIUS + NODE_WIDTH / 4)
        .attr('height', PORT_MOUSE_RADIUS * 2)
        // When user drags the tmpEdge onto a matched input port, snap the
        // tmpEdge onto it and update its visual for better UX.
        .on('mouseenter',
            (event, d) => {
              if (!this.hasTmpEdge()) {
                return;
              }
              const canConnect = !d3.select(event.target.parentElement)
                                      .select('path.port')
                                      .classed('not-matching-tmp-edge');
              if (canConnect) {
                const node = this.state.graphNodesMap[d.node.key];
                this.state.tmpEdgeTarget = {
                  key: node.key,
                  store: d.name,
                  portEle: event.target,
                  bindings: d.bindings
                };
                this.state.tmpEdge[0].endX = node.position.x;
                this.state.tmpEdge[0].endY =
                    node.position.y + this.getPortY(d.index);
                this.renderTmpEdge();

                d3.select(event.target.parentElement)
                    .select('path.port')
                    .attr('stroke', 'white')
                    .attr('fill', node.color);
              }
            })
        // "Free" the tmpEdge when user drags it away from the port.
        .on('mouseleave', (event, d) => {
          d3.select(event.target.parentElement)
              .classed('just-connected', false);
          this.state.tmpEdgeTarget = undefined;
          d3.select(event.target.parentElement)
              .select('path.port')
              .attr('stroke', d => d.node.color)
              .attr('fill', 'white');
          this.renderTmpEdge();
        });

    // Render the actual input port, a rounded-corner triangle.
    inputPortsEnter.append('path')
        .classed('port', true)
        .attr('d', ROUNDED_CORNER_TRIANGLE_PATH)
        .attr(
            'transform',
            (d, i) => `rotate(90) translate(${this.getPortY(i) - 5.5}, -6)`)
        .attr('stroke', d => d.node.color)
        .attr('fill', 'white');
    // Show a "+" sign in the triangle if the input support multiple
    // connections.
    inputPortsEnter.append('path')
        .classed('plus', true)
        .attr(
            'd',
            (d, i) => {
              if (d.multiple) {
                const y = Math.floor(this.getPortY(i));
                return `M -1.5 ${y} L 2.5 ${y} M 0.5 ${y - 2} L 0.5 ${y + 2}`;
              }
              return '';
            })
        .attr('stroke', d => d.node.color)
        .attr('stroke-width', 1.2)
        .attr('fill', 'none');

    // Input store type label, visible on hover.
    inputPortsEnter.append('foreignObject')
        .attr('x', -IO_STORE_TYPE_LABEL_WIDTH - 10)
        .attr('y', (d, i) => this.getPortY(i) - 10)
        .attr('width', IO_STORE_TYPE_LABEL_WIDTH)
        .classed('store-name-container input', true)
        .append('xhtml:div')
        .classed('store-name', true)
        .text(
            d => `${this.getIOTypeLabel(d)} ${d.multiple ? '(multiple)' : ''}`);

    // Dim the input port when
    // - User is trying to connect an edge (e.g. tmpEdge exists)
    // - The input port doesn't match the tmpEdge or it already has a connected
    //   edge.
    inputPortsEnter.merge(inputPortsSelection)
        .select('path.port')
        .classed('not-matching-tmp-edge', d => {
          return this.hasTmpEdge() &&
              (!this.matchTmpEdge(d) ||
               (!d.multiple && this.hasConnectedEdge(d, d.node.key)));
        });
  }

  renderOutputPorts(nodesUpdate) {
    // Bind data.
    const outputPortsSelection =
        nodesUpdate.selectAll('g.output-port')
            .data(d => d.outputs.map((output, index) => {
              return {...output, color: d.color, key: d.key, index, node: d};
            }));
    const outputPortsEnter =
        outputPortsSelection.enter().append('g').classed('output-port', true);

    // A circle that covers an extended area around the actual output port that
    // reacts to mouse events. This is to make it easier for users to interact
    // with the port.
    outputPortsEnter.append('rect')
        .classed('port-bg output', true)
        .attr('x', NODE_WIDTH - PORT_MOUSE_RADIUS)
        .attr('y', (d, i) => this.getPortY(i) - PORT_MOUSE_RADIUS)
        .attr('width', PORT_MOUSE_RADIUS * 2)
        .attr('height', PORT_MOUSE_RADIUS * 2)
        // Update the visual of the actual output port when user enters/leaves
        // this area.
        .on('mouseenter',
            (event, d) => {
              d3.select(event.target.parentElement)
                  .select('circle.port')
                  .attr('stroke', 'white')
                  .attr('fill', d => d.color);
            })
        .on('mouseleave',
            (event, d) => {
              // Don't reset the visual if user is dragging the tmpEdge.
              if (this.hasTmpEdge()) {
                return;
              }
              d3.select(event.target.parentElement)
                  .select('circle.port')
                  .attr('stroke', d => d.color)
                  .attr('fill', 'white');
            })
        // Handle dragging tmpEdge.
        .call(d3.drag()
                  // When user starts dragging from an output port, store where
                  // the tmpEdge comes from and its initial end point positions.
                  .on('start',
                      (event, d) => {
                        this.state.tmpEdgeFromNode =
                            this.state.graphNodesMap[d.key];
                        this.state.tmpEdgeFromStore = d.name;
                        const startX =
                            this.state.tmpEdgeFromNode.position.x + NODE_WIDTH;
                        const startY = this.state.tmpEdgeFromNode.position.y +
                            this.getPortY(d.index);
                        const endX = startX;
                        const endY = startY;
                        this.state.tmpEdge = [{
                          startX,
                          startY,
                          endX,
                          endY,
                        }];
                        this.renderNodes();
                        this.renderTmpEdge();
                        this.state.svg.classList.add('dragging-tmp-edge');
                      })
                  // When user is dragging the tmpEdge, update its end point.
                  .on('drag',
                      (event, d) => {
                        // Don't move the end point anymore when it reaches a
                        // matching input port (i.e. snap it to the matching
                        // input port).
                        //
                        // tmpEdgeTarget is set in renderInputPorts when user
                        // drags the tmpEdge onto a matching input port.
                        if (this.state.tmpEdgeTarget) {
                          return;
                        }
                        this.state.tmpEdge[0].endX =
                            event.x + this.state.tmpEdgeFromNode.position.x;
                        this.state.tmpEdge[0].endY =
                            event.y + this.state.tmpEdgeFromNode.position.y;
                        this.renderTmpEdge();
                      })
                  // When user releases the tmpEdge on a matching input port,
                  // fire the "edge-connected" event with essential data. The
                  // editor will handle it and update the internal data in the
                  // corresponding pipeline node object.
                  .on('end', (event, d) => {
                    let shouldClearTmpEdge = true;
                    if (this.state.tmpEdgeTarget) {
                      // Use "just-connected" class to mark the input
                      // port when an edge is just connected. With this class
                      // present, the store type label won't appear. The
                      // "just-connected" class will be removed when mouse moves
                      // out of the input port.
                      d3.select(this.state.tmpEdgeTarget.portEle.parentElement)
                          .classed('just-connected', true);
                      const fromKey = this.state.tmpEdgeFromNode.key;
                      const fromStore = this.state.tmpEdgeFromStore;
                      const toKey = this.state.tmpEdgeTarget.key;
                      const toStore = this.state.tmpEdgeTarget.store;
                      const toBindings = this.state.tmpEdgeTarget.bindings;
                      this.value =
                          {fromKey, fromStore, toKey, toStore, toBindings};
                      this.fire('edge-connected');
                    }
                    // When dropping the tmpEdge on empty space, show a menu
                    // listing all the candidate nodes that the current node can
                    // connect to.
                    else {
                      const candidateGroups =
                          this.state.connectableCandidates[d.type];
                      if (candidateGroups && candidateGroups.length > 0) {
                        shouldClearTmpEdge = false;
                        this.showCandidateChooserDialog(
                            d.type, candidateGroups, this.state.tmpEdge[0].endX,
                            this.state.tmpEdge[0].endY);
                      }
                    }
                    if (shouldClearTmpEdge) {
                      this.clearTmpEdge();
                    }
                  }));

    // Render the actual output port circle.
    outputPortsEnter.append('circle')
        .classed('port', true)
        .attr('r', OUTOUT_PORT_RADIUS)
        .attr('stroke', d => d.color)
        .attr('fill', 'white')
        .attr('cx', NODE_WIDTH)
        .attr('cy', (d, i) => this.getPortY(i));

    // Output store type label, visible on hover.
    outputPortsEnter.append('foreignObject')
        .attr('x', NODE_WIDTH + OUTOUT_PORT_RADIUS / 2 + 6)
        .attr('y', (d, i) => this.getPortY(i) - 10)
        .attr('width', IO_STORE_TYPE_LABEL_WIDTH)
        .classed('store-name-container', true)
        .append('xhtml:div')
        .classed('store-name', true)
        .text(d => this.getIOTypeLabel(d));

    // Always hide output ports when tmp edge appears.
    outputPortsEnter.merge(outputPortsSelection)
        .select('circle.port')
        .classed(
            'not-matching-tmp-edge',
            d => (!this.isTmpEdgeFromNode(d.node) ||
                  this.isTmpEdgeFromNode(d.node) &&
                      d.name !== this.state.tmpEdgeFromStore) &&
                this.hasTmpEdge())
        .attr(
            'fill',
            d => this.isTmpEdgeFromNode(d.node) &&
                    d.name === this.state.tmpEdgeFromStore &&
                    this.hasTmpEdge() ?
                d.color :
                'white')
        .attr(
            'stroke',
            d => this.isTmpEdgeFromNode(d.node) &&
                    d.name === this.state.tmpEdgeFromStore &&
                    this.hasTmpEdge() ?
                'white' :
                d.color);
  }

  renderEdges() {
    // Bind data.
    const edgesContainer =
        d3.select(this.state.svg).select('g.edges-container');
    const edgesSelection =
        edgesContainer.selectAll('g.edge').data(this.state.graphEdges);

    // Render edge.
    const edgesEnter = edgesSelection.enter()
                           .append('g')
                           .classed('edge', true)
                           // Clicking on an edge selects it, and at the same
                           // time deselects any selected node.
                           .on('mousedown', (event, d) => {
                             this.updateSelectedEdge(d.id);
                             this.updateSelectedNode(undefined);
                           });
    // Similar to input/output ports, an edge has an invisible extended area
    // that reacts to mouse event. It is to make it easier for users to
    // click/hover on an edge.
    edgesEnter.append('path').classed('edge-bg', true);
    edgesEnter.append('path').classed('edge', true);

    const edgesUpdate = edgesEnter.merge(edgesSelection);
    // Update selection state.
    edgesUpdate.classed('selected', d => d.id === this.state.selectedEdgeId);

    // Update edge path.
    edgesUpdate.select('path.edge-bg').attr('d', d => {
      const {fromX, fromY, toX, toY} = this.getEdgeStartEndPoint(d);
      return this.getEdgePath(fromX, fromY, toX, toY);
    });
    edgesUpdate.select('path.edge').attr('d', d => {
      const {fromX, fromY, toX, toY} = this.getEdgeStartEndPoint(d);
      return this.getEdgePath(fromX, fromY, toX, toY);
    });

    // Remove edges are no longer exist.
    edgesSelection.exit().remove();
  }

  renderTmpEdge() {
    const tmpEdgeSelection = d3.select(this.state.svg)
                                 .select('g.tmp-edge-container')
                                 .selectAll('path.tmp-edge')
                                 .data(this.state.tmpEdge);

    const tmpEdgeEnter = tmpEdgeSelection.enter()
                             .append('path')
                             .classed('tmp-edge', true)
                             .attr('stroke', 'red');

    tmpEdgeEnter.merge(tmpEdgeSelection)
        .attr('stroke-dasharray', '5,5')
        .attr(
            'd',
            d => `${this.getEdgePath(d.startX, d.startY, d.endX, d.endY)}`);

    tmpEdgeSelection.exit().remove();
  }

  /** Whether a tmpEdge exists or not. */
  hasTmpEdge() {
    return this.state.tmpEdge && this.state.tmpEdge.length === 1;
  }

  /** Whether the given node has any input that matches the tmpEdge. */
  hasMatchingInputForTmpEdge(node) {
    for (const input of node.inputs) {
      if (this.matchTmpEdge(input) &&
          (input.multiple || !this.hasConnectedEdge(input, node.key))) {
        return true;
      }
    }
    return false;
  }

  /** Whether the given input matches the tmpEdge. */
  matchTmpEdge(input) {
    return input.candidates.some(
        candidate => candidate.from === this.state.tmpEdgeFromNode.key &&
            candidate.storeName === this.state.tmpEdgeFromStore);
  }

  /** Whether the given node is the source of the tmpEdge. */
  isTmpEdgeFromNode(node) {
    return node.key === this.state.tmpEdgeFromNode?.key;
  }

  /** Whether the given input on the given node has a connected edge. */
  hasConnectedEdge(input, nodeKey) {
    return this.state.graphEdges.some(
        edge => edge.toKey === nodeKey && edge.toStore === input.name);
  }

  isNodeSelectedAsMain(node) {
    return node.selected;
  }

  isNodeShiftSelected(node) {
    return !node.selected &&
        this.state.localSelectedNodeKeys.includes(node.key);
  }

  /**
   * Calculates the node height based on the numbers of input and output ports.
   */
  getNodeHeight(node) {
    const maxNumInputsOrOutputs =
        Math.max(node.inputs.length, node.outputs.length);
    const numPortRows = Math.max(1, maxNumInputsOrOutputs);
    return NODE_TOP_BOTTOM_PADDING * 2 + PORT_ROW_HEIGHT * numPortRows;
  }

  /** Calculates the Y offset of an input/output port. */
  getPortY(index) {
    return NODE_TOP_BOTTOM_PADDING + (index + 0.5) * PORT_ROW_HEIGHT;
  }

  /** Calculates the positions of the end points of a given edge. */
  getEdgeStartEndPoint(edge) {
    const fromNode = this.state.graphNodesMap[edge.fromKey];
    const toNode = this.state.graphNodesMap[edge.toKey];
    const fromStoreIndex =
        fromNode.outputs.map(output => output.name).indexOf(edge.fromStore);
    const toStoreIndex =
        toNode.inputs.map(input => input.name).indexOf(edge.toStore);
    const fromX = fromNode.position.x + NODE_WIDTH;
    const fromY = fromNode.position.y + this.getPortY(fromStoreIndex);
    const toX = toNode.position.x;
    const toY = toNode.position.y + this.getPortY(toStoreIndex);
    return {fromX, fromY, toX, toY};
  }

  /** Constructs the svg path for an edge. */
  getEdgePath(startX, startY, endX, endY) {
    return `M${startX},${startY} C${startX + (endX - startX) / 2},${startY} ${
        endX - (endX - startX) / 2},${endY}  ${endX},${endY}`;
  }

  onClickDeleteNodesOrEdge() {
    this.deleteSelectedNodes();
    this.deleteSelectedEdges();
  }

  onClickDuplicateNodes() {
    this.value = this.state.localSelectedNodeKeys;
    this.fire('nodes-duplicated');
  }

  /** This is needed to disable the unnecessary drop animation. */
  onDragOver(e) {
    e.preventDefault();
  }

  /**
   * Handles when the node graph receives a dropped node type from the catalog.
   */
  onDrop(e) {
    this.state.localSelectedNodeKeys = [];
    this.updateToolbar();

    // Get the node type key from the payload
    const itemKey = e.dataTransfer.getData('text/plain');

    // Convert the screen position to svg position.
    const svgPoint = this.toSvgPoint(
        e.clientX - NODE_WIDTH / 2 * this.state.curZoomFactor,
        e.clientY -
            (NODE_TOP_BOTTOM_PADDING * 2 + PORT_ROW_HEIGHT) / 2 *
                this.state.curZoomFactor);
    svgPoint.x /= this.state.curZoomFactor;
    svgPoint.y /= this.state.curZoomFactor;
    svgPoint.x -= this.state.curTranslateX / this.state.curZoomFactor;
    svgPoint.y -= this.state.curTranslateY / this.state.curZoomFactor;

    // Fire the "nodetype-dropped" event with the node type key and its svg
    // position. The editor will handle it and create a new node in the current
    // pipeine and set its position.
    this.key = itemKey;
    this.value = {svgPoint: snapPosition(svgPoint)};
    this.fire('nodetype-dropped');
  }

  /** Converts the screen position to svg position. */
  toSvgPoint(x, y) {
    const svg = this.state.svg.ownerSVGElement || this.state.svg;
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const tpt = pt.matrixTransform(svg.getScreenCTM().inverse());
    return {x: tpt.x, y: tpt.y};
  }

  /** Converts a point in svg coordinates to global/screen coordinates. */
  toGlobalPoint(x, y) {
    const svg = this.state.svg.ownerSVGElement || this.state.svg;
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const tpt = pt.matrixTransform(svg.getScreenCTM());
    return {x: tpt.x, y: tpt.y};
  }

  /** Zooms/pans the svg content to fit the current viewport.  */
  fitNodeGraphToView(padding = 5, transitionDuration = 300) {
    const svg = this.state.svg;
    if (!svg) return;

    const parent = svg.parentElement;
    if (!parent) return;

    const bounds = svg.querySelector('g.content').getBBox();

    let transform = d3.zoomIdentity;
    if (bounds.width !== 0 && bounds.height !== 0) {
      // Padded bounds.
      bounds.x -= padding;
      bounds.y -= padding;
      bounds.width += padding * 2;
      bounds.height += padding * 2;

      const fullWidth = parent.clientWidth;
      const fullHeight = parent.clientHeight;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      if (width === 0 || height === 0) return;  // nothing to fit

      const isContentSmallerThanContainer =
          width < fullWidth && height < fullHeight;
      const scale = isContentSmallerThanContainer ?
          Math.min(1, Math.max(fullWidth / width, fullHeight / height)) :
          Math.min(fullWidth / width, fullHeight / height);
      const translate = [
        fullWidth / 2 - scale * (midX - this.state.curTranslateX),
        fullHeight / 2 - scale * (midY - this.state.curTranslateY)
      ];
      transform = d3.zoomIdentity.translate(translate[0], translate[1])
                      .scale(scale * this.state.curZoomFactor);
    }

    d3.select(svg)
        .transition()
        .duration(transitionDuration)  // milliseconds
        .call(this.state.zoom.transform, transform);
  }

  clearTmpEdge() {
    this.state.tmpEdgeFromNode = undefined;
    this.state.tmpEdgeFromStore = undefined;
    this.state.tmpEdge = [];
    this.state.svg.classList.remove('dragging-tmp-edge');
    this.renderTmpEdge();
    this.renderNodes();
  }

  getIOTypeLabel(io) {
    return `${io.name}: ${io.type}`;
  }

  onClickCandidateChooserBackdrop() {
    this.hideCandidateChooserDialog();
    this.clearTmpEdge();
  }

  showCandidateChooserDialog(targetStoreType, groups, svgX, svgY) {
    // Populate the dialog content.
    this.populateCandidateDialog(targetStoreType, groups, svgX, svgY);

    // Figure out the actual height of the dialog by setting its opacity to
    // 0 and show it.
    this.state.candidateChooserDialog.style.opacity = 0;
    this.state.candidateChooserBackdrop.classList.remove('hide');
    const dialogHeight = this.state.candidateChooserDialog.offsetHeight;

    // Get the screen coordinate of the given svg point.
    let {x, y} = this.toGlobalPoint(
        svgX * this.state.curZoomFactor, svgY * this.state.curZoomFactor);
    x += this.state.curTranslateX;
    y += this.state.curTranslateY;

    // Offset the dialog if necessary so that it won't go out of the screen.
    if (y + dialogHeight > document.body.offsetHeight) {
      y = document.body.offsetHeight - dialogHeight - 8;
    }

    // Show dialog
    this.state.candidateChooserDialog.style.left = `${x}px`;
    this.state.candidateChooserDialog.style.top = `${y}px`;
    this.state.candidateChooserDialogContent.scrollTop = 0;
    this.state.candidateChooserDialog.style.opacity = 1;
  }

  populateCandidateDialog(targetStoreType, groups, svgX, svgY) {
    this.state.candidateChooserDialogContent.innerHTML = '';

    const groupsSelection = d3.select(this.state.candidateChooserDialogContent)
                                .selectAll('div.candidate-group')
                                .data(groups);

    // Group title.
    const groupsEnter =
        groupsSelection.enter().append('div').classed('candidate-group', true);
    const groupContainer =
        groupsEnter.append('div').classed('group-container', true);
    groupContainer.append('icon')
        .text(d => d.icon)
        .style('color', d => d.color);
    groupContainer.append('div')
        .classed('group-name', true)
        .text(d => d.category);

    // Node types.
    // TODO(mariakleiner): node-graph-editor shouldn't know anything about nodeTypes, and only deal with `key`s.
    const nodeTypesSelection =
        groupsEnter.selectAll('div.node-type').data(d => d.nodeTypes);
    const nodeTypesEnter =
        nodeTypesSelection.enter()
            .append('div')
            .classed('node-type', true)
            // Fire event when a candidate is selected.
            .on('click', (event, nodeType) => {
              event.stopPropagation();

              // Calculate the offsetY when positioning the candidate node so
              // that its first matching port is located at the point where
              // the tmpEdge is dropped.
              // TODO(b/244191110): Type matching API to be wired here.
              const targetStoreIndex =
                  Object.keys(nodeType.$stores)
                      .findIndex(
                          storeName => nodeType.$stores[storeName].$type ===
                              targetStoreType);
              const offsetY =
                  this.getPortY(targetStoreIndex) * this.state.curZoomFactor;

              const {x, y} = snapPosition({x: svgX, y: svgY - offsetY});
              this.value = {
                fromKey: this.state.tmpEdgeFromNode.key,
                fromStore: this.state.tmpEdgeFromStore,
                targetStoreType,
                nodeType,
                svgX: x,
                svgY: y
              };
              this.fire('add-candidate');
              this.onClickCandidateChooserBackdrop();
            });
    nodeTypesEnter.append('div')
        .classed('node-type-label', true)
        .text(({$meta: {displayName, id}}) => displayName || id);
  }

  hideCandidateChooserDialog() {
    this.state.candidateChooserBackdrop.classList.add('hide');
  }
}
customElements.define('node-graph-editor', NodeGraphEditor);
