/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */

import {initRtc} from './web-rtc.js';
//import {getBasicCameraStream} from './cameras/basic-camera.js';
import {getArcsCameraStream} from './cameras/arcs-camera.js';

//initRtc(getBasicCameraStream);
initRtc(getArcsCameraStream);
