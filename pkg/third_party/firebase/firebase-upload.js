/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import {Xen} from '../../Library/Dom/xen/xen-async.js';
import {logFactory} from '../arcs/js/utils/log.js';
import {configureFirebase} from './firebase.js';

const template = `
  <style>
    ::slotted(*) {
      cursor: pointer;
    }
    input[type="file"] {
      display: none;
    }
  </style>
  <label on-click="onLabelClick">
    <slot></slot>
    <input type="file" accept="{{accept}}" multiple="{{multiple}}" on-change="onFilesChanged">
  </label>
`;

const log = logFactory(true, 'FirebaseUpload', '#ffb9b4');

class FirebaseUpload extends Xen.Async {
  get template() {
    return template;
  }
  static get observedAttributes() {
    return ['multiple', 'accept', 'valid'];
  }
  update({valid}, state) {
    if (valid && state.file && !state.uploaded && state.uploadingFileName !== state.file.name) {
      state.uploadingFileName = state.file.name;
      log(`uploading file ${state.file.name}`);
      this.uploadFile(state.file, `files/${state.file.name}`);
    }
  }
  render({accept, multiple}, {}) {
    return {accept, multiple};
  }
  onLabelClick(e) {
    e.stopPropagation();
  }
  onFilesChanged(e) {
    const files = e.currentTarget.files;
    for (let i = 0; i < files?.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const img = this.appendChild(document.createElement("img"));
        const reader = new FileReader();
        reader.onload = () => img.src = reader.result;
        reader.readAsDataURL(file);
      }
      log(`Validating ${file.name}.`);
      this.mergeState({file, uploaded: false});
      if (!this.squelch) {
        this.key = file.name;
        this.value = URL.createObjectURL(file);
        this.fire('changes');
      }
    }
  }
  async uploadFile(file, uploadPath) {
    const {storage} = await configureFirebase(`arcs-storage-test`);
    const ref = storage.ref().child(uploadPath);
    const next = snapshot => {
      const percent =
          Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100.0);
      log(`Upload progress [percent=${percent}%, state=${snapshot.state}].`);
      this.value = percent;
      this.fire('progress', {percent});
    };
    const error = error => {
      log.error('Error uploading', error);
      this.value = error;
      this._fire('error');
    };
    const complete = () => this.uploadComplete(ref);
    ref.put(file).on(firebase.storage.TaskEvent.STATE_CHANGED, {next, error, complete});
  }
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve({width: image.width, height: image.height});
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error({}));
      };
      image.src = url;
    });
  }
  async uploadComplete(ref) {
    try {
      const url = await ref.getDownloadURL();
      this.value = url;
      this.mergeState({uploaded: true});
      // const {width, height} = await this.getImageDimensions(file);
      //   log(`Image dimensions [width=${width}, height=${height}].`);
      //   this.value = {width, height, url};
      this.fire('upload');
    } catch (error) {
      log.error('Error getting download url', error);
      this.value = error;
      this.fire('error');
    }
  }
}
customElements.define('firebase-upload', FirebaseUpload);
