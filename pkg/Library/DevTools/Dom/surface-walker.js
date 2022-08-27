import {Xen} from '../../Dom/Xen/xen-async.js';

export const SurfaceWalker = class {
  from(root) {
    //console.group(root);
    const result = {
      id: this.classify(root)
    };
    const elements = [...root.children, ...root.shadowRoot?.children ?? []];
    const children = this.children(elements);
    if (children?.length) {
      result.children = children;
    }
    //console.groupEnd(result);
    return result;
  }
  classify(root) {
    const names = [];
    const a$ = root?.attributes;
    if (a$) {
      const id = a$.id?.value;
      const particleName = a$.particle?.value;
      if (id === 'arc') {
        names.push(`Arc`)
      }
      if (particleName) {
        names.push(`${particleName} (Particle)`)
      }
      if (names.length) {
        return names.join(':');
      }
    }
    return null;
  }
  children(children) {
    let nodes = [];
    children && [...children].forEach(child => {
      const node = this.from(child);
      if (node.id) {
        nodes.push(node);
      } else if (node.children?.length) {
        nodes = [...nodes, ...node.children];
      }
    });
    return nodes;
  }
};

const template = Xen.Template.html`
<!-- <mwc-icon-button right-aligned icon="refresh" on-click="onRefreshClick"></mwc-icon-button> -->
<data-explorer expand object="{{om}}"></data-explorer>
`;

export class SurfaceWalkerElement extends Xen.Async {
  static get observedAttributes() {
    return ['object', 'kick'];
  }
  get template() {
    return template;
  }
  update() {
    this.refresh();
  }
  onRefreshClick() {
    this.refresh();
  }
  refresh() {
    const data = new SurfaceWalker().from(document.body);
    const stratify = mapped => {
      const strata = {};
      mapped.children?.forEach((child, i) => strata[`${child.id} (${i})`] = stratify(child));
      return strata;
    };
    const om = stratify(data);
    this.mergeState({om});
  }
  render(inputs, {om}) {
    return {om};
  }
}

customElements.define('surface-walker', SurfaceWalkerElement);
