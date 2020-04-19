import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

let buffer: any[] = [];
let callback = (event: MessageEvent) => {
  buffer.push(event.data.pluginMessage);
}

window.addEventListener("message", (event) => {
  callback(event);
})

class App extends React.Component<{}, { uri: string | null, autoRefresh: boolean, showWarning: boolean }> {
  state = { uri: null, autoRefresh: true, showWarning: false }
  buffer: string | null = null

  handleMessage = (msg: any) => {
    const img = msg.uri && btoa(msg.uri)
    if (msg.type === "img" && (this.state.uri == null || this.state.autoRefresh)) {
      this.setState({ uri: img })
    } else if (msg.type === "warn") {
      this.setState({ showWarning: true })
    }
    this.buffer = img
  }

  refresh = () => {
    this.setState({ uri: this.buffer })
  }

  toggleAutoRefresh = () => {
    if (!this.state.autoRefresh) this.refresh();
    this.setState({ autoRefresh: !this.state.autoRefresh })
  }

  componentDidMount() {
    for (const ev of buffer) this.handleMessage(ev);
    buffer = [];
    callback = (ev) => this.handleMessage(ev.data.pluginMessage);
  }

  render() {
    return <>
      <div className="container">
        {this.state.uri && <img src={`data:image/png;base64,${this.state.uri}`} />}
        {this.state.showWarning && <div className="warn">
          This game was created with the previous version of the Game Table plugin and
          will no longer function as intended. Please reset the game to upgrade to the
          latest version.
        </div>}
      </div>
      <div className="options">
        <div className="option refresh" onClick={this.refresh}>
        <svg height="20px" width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path fill="#fff" d="M 20 4 C 14.507813 4 10 8.507813 10 14 L 10 31.75 L 7.125 28.875 L 4.3125 31.71875 L 12 39.40625 L 19.6875 31.71875 L 16.875 28.90625 L 14 31.75 L 14 14 C 14 10.691406 16.691406 8 20 8 L 31 8 L 31 4 Z M 38 10.59375 L 30.28125 18.3125 L 33.125 21.125 L 36 18.25 L 36 36 C 36 39.308594 33.308594 42 30 42 L 19 42 L 19 46 L 30 46 C 35.492188 46 40 41.492188 40 36 L 40 18.25 L 42.875 21.125 L 45.6875 18.28125 Z"></path></svg>
        </div>
        <div className="option">
          <input type="checkbox" checked={this.state.autoRefresh} onChange={this.toggleAutoRefresh} />
          &nbsp;Auto-Refresh&nbsp;
        </div>
      </div>
    </>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
