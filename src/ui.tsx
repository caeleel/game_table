import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'
import { QRCode } from './qrcode'

let buffer: any[] = [];
let callback = (event: MessageEvent) => {
  buffer.push(event.data.pluginMessage);
}

window.addEventListener("message", (event) => {
  callback(event);
})

class QRCodeComp extends React.Component<{ url: string }> {
  componentDidMount() {
    new QRCode(document.getElementById("qrcode"), this.props.url)
  }

  render() {
    return <div className="qrcode"><div id="qrcode"></div></div>
  }
}

interface PlayerData {
  name: string
  frameID: string
}

class App extends React.Component<{}, { url: string, frameSelected: boolean, viewerFrame: string | null }> {
  state = { url: "", viewerFrame: null, frameSelected: false }

  handleMessage = (msg: any) => {
    if (msg.type === "setURL") {
      this.setState({ url: msg.url })
    } else if (msg.type === "setViewerFrame") {
      this.setState({ viewerFrame: msg.viewerFrame, frameSelected: true })
    } else if (msg.type === "unsetViewerFrame") {
      this.setState({ viewerFrame: null, frameSelected: false })
    }
  }

  componentDidMount() {
    for (const ev of buffer) this.handleMessage(ev);
    buffer = [];
    callback = (ev) => this.handleMessage(ev.data.pluginMessage);
  }

  sendURL = () => {
    parent.postMessage({ pluginMessage: { type: "setURL", url: this.state.url } }, "*")
  }

  setURL = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ url: ev.target.value.split('?')[0] })
  }

  sendViewingFrame = () => {
    parent.postMessage({ pluginMessage: { type: "setViewerFrame" } }, "*")
  }

  render() {
    const playerURL = this.state.viewerFrame ? `${this.state.url}?node-id=${this.state.viewerFrame.replace(':', '%3A')}` : ''

    return <div>
      <input className="url_input" type="text" value={this.state.url} onChange={this.setURL} />
      <button onClick={this.sendURL}>Set URL</button>
      { this.state.frameSelected && !this.state.viewerFrame && <div className="set_window">
        <button onClick={this.sendViewingFrame}>Set as Viewing Window</button>
      </div> }
      { this.state.viewerFrame && <div>
        <QRCodeComp key={playerURL} url={playerURL} />
        <div className="url">{playerURL}</div>
      </div> }
    </div>


    return 
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
