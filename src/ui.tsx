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

class App extends React.Component<{}, { url: string, players: PlayerData[], activePlayer: PlayerData | null }> {
  state = { url: "", players: [], activePlayer: null }

  handleMessage = (msg: any) => {
    if (msg.type === "setURL") {
      this.setState({ url: msg.url })
    } else if (msg.type === "playerFrames") {
      const players: PlayerData[] = []
      for (const player in msg.playerFrames) {
        players.push({ name: player, frameID: msg.playerFrames[player] })
      }
      this.setState({ players })
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
    this.setState({ url: ev.target.value })
  }

  shuffle = () => {
    parent.postMessage({ pluginMessage: { type: "shuffle" }}, "*")
  }

  gather = () => {
    parent.postMessage({ pluginMessage: { type: "gather" }}, "*")
  }

  flip = () => {
    parent.postMessage({ pluginMessage: { type: "flip" }}, "*")
  }

  render() {
    if (this.state.activePlayer === null) {
      return <div>
        <input className="url_input" type="text" value={this.state.url} onChange={this.setURL} />
        <button onClick={this.sendURL}>Set URL</button>
        <div className="players">
          {this.state.players.map((player) => {
            return <div className="player" key={player.frameID}>
              <div className="info" onClick={() => this.setState({ activePlayer: player })}>i</div>
              <div className="name">{player.name}</div>
            </div>
          })}
        </div>
        <button onClick={this.shuffle}>Shuffle</button>
        <button onClick={this.gather}>Gather</button>
        <button onClick={this.flip}>Flip</button>
      </div>
    }

    const playerURL = `${this.state.url}?node-id=${this.state.activePlayer.frameID.replace(':', '%3A')}`

    return <div>
      <div className="back"><button onClick={() => this.setState({ activePlayer: null })}>{`< Back`}</button></div>
      <QRCodeComp key={playerURL} url={playerURL} />
      <div className="url">{playerURL}</div>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
