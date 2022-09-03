/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

let log = () => {};
log.warn = console.warn.bind(console);

if (globalThis.config?.logFlags?.composer) {
  const style = `background: #333; color: #eee; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  log = console.log.bind(console, `%cComposer`, style);
}

export class Composer {
  constructor() {
    this.slots = {};
    this.pendingPackets = [];
  }
  processPendingPackets() {
    const packets = this.pendingPackets;
    if (packets.length) {
      this.pendingPackets = [];
      packets.forEach(packet => {
        packet.pendCount = (packet.pendCount || 0) + 1;
        this.render(packet);
      });
    }
  }
  render(packet) {
    const {id, container, content: {model, template}} = packet;
    log({id, container, model});
    if (model?.$clear) {
      this._clearSlot(id);
    } else if (template) {
      let slot = this.slots[id];
      if (slot && slot.container !== container) {
        this._clearSlot(id);
        slot = null;
      }
      if (!slot) {
        slot = this.maybeGenerateSlot(packet);
      }
      if (slot) {
        this.renderSlot(slot, packet);
      }
    }
  }
  renderSlot(slot, {container, content: {model}}) {
    this.maybeReattachSlot(slot, container);
    slot.set(model);
    this.processPendingPackets();
  }
  maybeGenerateSlot(packet) {
    const {id, container, content: {template}} = packet;
    // slot has a parent container
    const parent = this.findContainer(container);
    if (parent) {
      // generate a slot `id` for `template` under `parent`
      const slot = this.generateSlot(id, template, parent);
      // memoize the container
      slot.container = container;
      // retain
      this.slots[id] = slot;
      // return
      return slot;
    }
    // packet has no slot (yet)
    this.pendingPackets.push(packet);
    log(`container [${container}] unavailable for slot [${id}]`);
    if ((++packet['pendCount'] % 1e4) === 0) {
      log.warn(`container [${container}] unavailable for slot [${id}] (x1e4)`);
    }
  }
  _clearSlot(id) {
    const slot = this.slots[id];
    if (slot) {
      this.processPendingPackets();
      this.slots[id] = null;
      this.clearSlot(slot);
    }
  }
  clearSlot(slot) {
  }
  findContainer(container) {
    return null;
  }
  generateSlot(id, template, parent) {
    return null;
  }
  onevent(pid, eventlet) {
    log(`[${pid}] sent [${eventlet.handler}] event`);
  }
  requestFontFamily(fontFamily) {
    return false;
  }
}
