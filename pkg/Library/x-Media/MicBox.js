({
render({mediaDeviceState, transcript}) {
  const micEnabled = Boolean(mediaDeviceState.isMicEnabled);
  return {
    micEnabled,
    text: transcript?.transcript || transcript?.interimTranscript || ''
  };
},

template: html`
<style>
  :host {
    flex: 0 !important;
    /* padding: 4px; */
  }
  [mic] {
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    margin: 6px;
    transition: all 200ms ease-out;
    width: 100%;
  }
  [mic][showing] {
    transform: translateY(0px);
  }
  [micbox] {
    overflow: hidden;
    height: 0;
    transition: all 200ms ease-out;
  }
  [micbox][showing] {
    height: 48px;
  }
  icon {
    font-size: 20px;
    margin-right: 2px !important;
  }
</style>
<div micbox bar showing$="{{micEnabled}}">
  <icon>mic</icon>
  <input mic value="{{text}}" on-change="onTextChange"/>
</div>
`
});
