/* eslint-disable no-console */
'use strict'

const React = require('react')
const ipfsClient = require('ipfs-http-client')
const BufferList = require('bl/BufferList')

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      added_file_hash: null,
      search_file_hash: null,
      isIFrameDisplayed : false,
      ipfs:ipfsClient("/ip4/127.0.0.1/tcp/5001")
    }

    // bind methods
    this.captureFile = this.captureFile.bind(this)
    this.saveToIpfs = this.saveToIpfs.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.connect = this.connect.bind(this)
    this.multiaddr = React.createRef()

    //this.multiaddr  = "/ip4/127.0.0.1/tcp/5001"
    //this.connect()
  }

  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
  
    this.saveToIpfs(event.target.files)
  }

  // Example #1
  // Add file to IPFS and return a CID
  async saveToIpfs ([ file ]) {
    try {
      const added = await this.state.ipfs.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      console.log(added)
      this.setState({ added_file_hash: added.cid.toString() })

    } catch (err) {
      console.error(err)
    }
  }

  handleSubmit (event) {
    event.preventDefault()
  }

  connect () {
    this.setState({
      //ipfs: ipfsClient(this.multiaddr.current.value)
      ipfs: ipfsClient("/ip4/127.0.0.1/tcp/5001")
    })
  }

  async search(){
		const inpVal = this.input.value;

    for await (const file of  this.state.ipfs.get(inpVal)) {
      console.log(file.path)

      const content = new BufferList()
      for await (const chunk of file.content) {
        content.append(chunk)
      }

      console.log(content.toString())
    }
  }
  
  searchlink(){
    const inpVal = this.input.value;
    this.setState({ search_file_hash: inpVal, isIFrameDisplayed: true })
  }

  render () {
    var iFrame = this.state.isIFrameDisplayed ? <iframe src={'https://ipfs.io/ipfs/' + this.state.search_file_hash}></iframe> : '';
      return (    
        <div>
          <h1> Upload File </h1>
          <form id='capture-media' onSubmit={this.handleSubmit}>
            <input type='file' name='input-file' id='input-file' onChange={this.captureFile} /><br/>
          </form>
          <div>
            <a id="gateway-link" target='_blank'
              href={'https://ipfs.io/ipfs/' + this.state.added_file_hash}>
              {this.state.added_file_hash}
            </a>
          </div>
          <div>
          <h1> Search File </h1>
            <input type="text" ref={input => this.input = input} defaultValue="Enter File Hash..."/>
            <button onClick={this.searchlink.bind(this)}>Enter</button>
          </div>
          <div>
            <a id="gateway-link" target='_blank'
              href={'https://ipfs.io/ipfs/' + this.state.search_file_hash}>
              {this.state.search_file_hash}
            </a> 
          </div>
          {iFrame}


        </div>
      )
  }
}
module.exports = App
