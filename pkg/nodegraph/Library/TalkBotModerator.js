/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({inChat, feedbackChat, max}) {
  let outChat = inChat;
  if (max && !inChat?.length) {
    feedbackChat = outChat = [{name: 'Moderator', phrase: 'Hello'}];
  }
  else if (max < inChat?.length) {
    feedbackChat = outChat = [...inChat].slice(0, max);
  }
  else if (max > inChat?.length) {
    feedbackChat = inChat
  }
  return {outChat, feedbackChat};
}
});
