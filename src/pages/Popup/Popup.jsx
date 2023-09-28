import React, { useState } from 'react';
import './Popup.css';
import list from '../../assets/img/urls.json'
import Fuse from 'fuse.js'

const mod = (n, m) => ((n % m) + m) % m;

const fuseOptions = {
  threshold: 0.3,
	keys: [
		"key",
		"url",
	]
};

const fuse = new Fuse(list, fuseOptions);

const Popup = () => {
  let [search, setSearch] = useState("");
  let [active, setActive] = useState(0);
  let [searchList, setSearchList] = useState(list);

  let searchFor = (search) => {
    setSearch(search)
    if (search === "")
      setSearchList(list)
    else
      setSearchList(fuse.search(search).map((x) => {
        return {
          url: x.item.url,
          icon: x.item.icon,
          key: x.item.key,
        }
      }))
  }

  let keyDown = (e) => {
    e.stopPropagation()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(mod(active + 1, searchList.length))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(mod(active - 1, searchList.length))
    }
    if (e.key === 'Enter')
      chrome.tabs.create({url: searchList[active].url})
  }

  return (
    <div className="App" onKeyDown={keyDown}>
      <input type="text" placeholder='Search' className='search' autoFocus value={search} onChange={(e) => searchFor(e.target.value)}/>
      <table className='table'>
        <tbody>
          {searchList.map((row, i) => (
            <tr key={i} className={i === active ? 'active' : ''}>
              <td><img className='icon' src={row.icon} alt={i}/></td>
              <td>{row.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Popup;
