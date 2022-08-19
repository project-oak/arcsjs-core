/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const log = console.log.bind(console);
log.warn = console.warn.bind(console);

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
    const {id, container, content: {template, model}} = packet;
    //log({id, container, model});
    let slot = this.slots[id];
    //
    if (model?.$clear) {
      if (slot) {
        this.processPendingPackets();
        this.slots[id] = null;
        this.clearSlot(slot);
      }
      return;
    }
    //
    if (!slot) {
      const parent = this.findContainer(container);
      //log.warn(`found parent, needs slot, container = `, container, parent);
      if (!parent) {
        this.pendingPackets.push(packet);
        if (packet['pendCount'] % 100 === 0) {
          log.warn(`container [${container}] unavailable for slot [${id}] (x100)`);
        }
        return;
      }
      slot = this.generateSlot(id, template, parent);
      this.slots[id] = slot;
    }
    if (slot && model) {
      slot.set(model);
      this.processPendingPackets();
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
