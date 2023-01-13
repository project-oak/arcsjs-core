/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {EventEmitter} from '../core/EventEmitter.js';
import {logFactory} from '../utils/log.js';
import {Slot} from '../recipe/types.js';

const log = logFactory(logFactory.flags.composer, 'composer', 'red');

export interface RenderPacket {
  id;
  container;
  content: {
    template,
    model,
    $clear
  }
}

export interface ComposerInterface {
  render(packet: RenderPacket);
  onevent(pid, eventlet);
}

export class Composer extends EventEmitter {
  protected slots;
  protected pendingPackets;
  constructor() {
    super();
    this.slots = {};
    this.pendingPackets = [];
  }
  activate() {
    this.fire('activate');
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
  render(packet: RenderPacket) {
    const {id, container, content: {template, model}} = packet;
    log({id, container, model});
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
        if ((++packet['pendCount'] % 1e4) === 0) {
          log.warn(`container [${container}] unavailable for slot [${id}] (x1e4)`);
        }
        return;
      }
      slot = this.generateSlot(id, template, parent);
      this.slots[id] = slot;
    }
    //
    if (slot && model) {
      this.maybeReattachSlot(slot, container);
      slot.set(model);
      this.processPendingPackets();
    }
  }
  clearSlot(slot) {
  }
  findContainer(container) {
    return null;
  }
  generateSlot(id, template, parent): Slot {
    return null;
  }
  maybeReattachSlot(slot, container) {
  }
  onevent(pid, eventlet) {
    log(`[${pid}] sent [${eventlet.handler}] event`);
  }
  requestFontFamily(fontFamily) {
    return false;
  }
}
