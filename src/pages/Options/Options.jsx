import React, { useState } from 'react';
import './Options.css';

const Options = () => {
  const [file, setFile] = useState();

  let handleOnChange = (e) => {  
    setFile(e.target.files[0]);
  }

  let onUpload = () => {
    file.text().then((text) => {
      chrome.runtime.getPackageDirectoryEntry((root) => {
        root.getFile('urls.json', {create: true}, (fileEntry) => {
          fileEntry.createWriter((fileWriter) => {
            fileWriter.write(new Blob([text], {type: 'application/json'}));
          })
        })
      });
      var obj = JSON.parse(text);
      chrome.storage.local.set({'urls': obj});
    })
  }

  return (
  <div className="OptionsContainer">
    <h2>Settings</h2>
    <div>
      <label htmlFor="file">Url file</label>
      <input id="file" name="file" type="file" accept='.json' onChange={handleOnChange}/>
      <button onClick={onUpload}>Upload</button>
    </div>
  </div>
  )
};

export default Options;
