/* eslint-disable no-console */
'use strict'

const React = require('react')
const ipfsClient = require('ipfs-http-client')
const all = require('it-all')
const CID = require('cids')
const BufferList = require('bl/BufferList')

/*class frame extends React.Component{
  render(){
    return(
      <iframe id="myframe" src = {'https://ipfs.io/ipfs/' + this.props.search_file_hash} ></iframe>
    )
  }
}*/
/*const Component = React.createClass({
  iframe: function () {
    return {
      __html: this.props.iframe
    }
  },

  render: function() {
    return (
      <div>
        <div dangerouslySetInnerHTML={ this.iframe() } />
      </div>
    );
  }
});*/

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
    if (document.getElementById('keep-filename').checked) {
      this.saveToIpfsWithFilename(event.target.files)
    } else {
      this.saveToIpfs(event.target.files)
    }
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

      /*const validCID = 'QmYoaPrdSpKKhysvS1teMsaAeC2qekuMZ84h8j71mAJDJD'

      this.state.ipfs.get(validCID, function (err, files) {
        console.log("hi! I'm in!")
        files.forEach((file) => {
          console.log(file.path)
          console.log("File content >> ",file.content.toString('utf8'))
        })
      })*/

    } catch (err) {
      console.error(err)
    }
  }

  // Example #2
  // Add file to IPFS and wrap it in a directory to keep the original filename
  async saveToIpfsWithFilename ([ file ]) {
    const fileDetails = {
      path: file.name,
      content: file
    }
    const options = {
      wrapWithDirectory: true,
      progress: (prog) => console.log(`received: ${prog}`)
    }

    try {
      const added = await this.state.ipfs.add(fileDetails, options)
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
    //console.log(inpVal)
    
    /*try{
      const res = await all(this.state.ipfs.get(inpVal) )
      console.log(res)
    } catch (err) {
      console.error(err)
    }*/
    
    //const cid = 'QmY9rBbbecaLXgTkHFM9zzv3Bf2fsYDFZatjj1zhP7BboA'

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
    //if (this.state.ipfs) {
      return (
        
        <div>
          <h1> Upload File </h1>
          <form id='capture-media' onSubmit={this.handleSubmit}>
            <input type='file' name='input-file' id='input-file' onChange={this.captureFile} /><br/>
            {/*<label htmlFor='keep-filename'><input type='checkbox' id='keep-filename' name='keep-filename' /> keep filename</label><br/>*/}
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
				    {/*<button onClick={this.search.bind(this)}></button>*/}
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
    //}

    //return (
      //<div style={{ textAlign: 'center' }}>
        //<h1>Enter the multiaddr for an IPFS node HTTP API</h1>
        //<form>
          //<input id="connect-input" type="text" defaultValue="/ip4/127.0.0.1/tcp/5001" ref={this.multiaddr} />
          //<input id="connect-submit" type="button" value="Connect" onClick={this.connect} />
        //</form>
      //</div>
    //)
  }
}
module.exports = App
