/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ComposerService = {
  // TODO(sjmiles): Ability to re-target the Render output of a Host
  // is a fundamentally new behavior ... so this is work-in-progress
  getContainer(arc, host, request) {
    const containerHost = ComposerService.getContainerHost(arc, host, request);
    return containerHost?.container;
  },
  getContainerHost(arc, _, request) {
    const hostName = this.getContainerHostName(request);
    return arc.hosts[hostName];
  },
  setContainer(arc, _, request) {
    const {hostId, container} = request.data;
    const host = arc.hosts[hostId];
    log(host, container);
    if (container.startsWith(hostId)) {
      log.error(hostId, 'cannot contain itself');
    } else {
      host.meta.container = container;
      this.rerender(arc);
      return host.container;
    }
  },
  rerender(arc) {
    Object.values(arc.hosts).forEach(host => host.rerender());
  }
};
