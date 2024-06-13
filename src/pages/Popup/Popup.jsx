import React, { useEffect, useState, useRef } from 'react';
import './Popup.css';
import Fuse from 'fuse.js'

const mod = (n, m) => ((n % m) + m) % m;

const fuseOptions = {
  threshold: 0.3,
	keys: [
		"key",
		"url",
    "extra"
	]
};

const Popup = () => {
  const [list, setList] = useState([]);
  let [search, setSearch] = useState("");
  let [active, setActive] = useState(0);
  let [searchList, setSearchList] = useState(list);
  const fuse = new Fuse(list, fuseOptions);

  const myRef = useRef(null)
  
  useEffect(() => {
    chrome.storage.local.get('urls')
      .then((res) => {
        let urls = res.urls ?? [];
        urls.sort((a,b) => a.key < b.key ? -1 : 1);
        setList(urls);
        setSearchList(urls);
      })
  }, []);

  let searchFor = (search) => {
    setSearch(search);

    if (search === "")
      setSearchList(list);
    else if (search.includes(":")) {
      const [type, key] = search.split(":", 2);
      const filteredList = list.filter((a) => a.type.includes(type));

      if (key.length === 0)
        setSearchList(filteredList);
      else
        setSearchList(new Fuse(filteredList, fuseOptions).search(key).map((x) => {
          return {
            url: x.item.url,
            icon: x.item.icon,
            key: x.item.key,
            extra: x.item.extra,
          }
        }));
    } else {
        setSearchList(fuse.search(search).map((x) => {
          return {
            url: x.item.url,
            icon: x.item.icon,
            key: x.item.key,
            extra: x.item.extra,
          }
        }));
    }
    
  }

  let keyDown = (e) => {
    e.stopPropagation(e.target)

    let newActive = 0

    if (searchList.length === 0)
      return

    if (active > searchList.length - 1)
      setActive(0)
    
    if (isNaN(active))
      setActive(searchList.length -1)
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      newActive = mod(active + 1, searchList.length)
      setActive(newActive)
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      newActive = mod(active - 1, searchList.length)
      setActive(newActive)
    }
    
    if (document.getElementById(newActive)) {
      document.getElementById(newActive).scrollIntoView({block: "center"});
    };

    if (e.key === 'Enter')
      chrome.tabs.create({url: searchList[active].url})
  }

  let refresh = () => {
    chrome.runtime.sendMessage({message: "refresh_data"});
  }

  return (
    <div className="App" onKeyDown={keyDown}>
      <div className='flex-container'>
        <input type="text" placeholder='Search' className='search' autoFocus value={search} onChange={(e) => searchFor(e.target.value)}/>
        <button onClick={e => refresh()} className='refresh refresh-button'><img alt="refresh" className='refresh' src='refresh.png'/></button>
      </div>
      <table className='table'>
        <tbody>
          {searchList.map((row, i) => (
            <tr id={i} ref={myRef} onClick={(e) => chrome.tabs.create({url: searchList[i].url})} key={i} className={i === active ? 'active' : ''}>
              <td><img className='icon' src={row.icon} alt={i}/></td>
              <td>
                <div>{row.key}</div>
                <div className="grey">{row.extra}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Popup;
