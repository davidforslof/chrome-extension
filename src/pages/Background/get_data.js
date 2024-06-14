let workspace_url = (page) =>
  `https://app.terraform.io/api/v2/organizations/eqtpartners/workspaces?page[size]=50&page[number]=${page}`;
let repo_url = (page) =>
  `https://github.com/orgs/EQTPartners/repositories?page=${page}&q=visibility%3Aprivate+archived%3Afalse`;

async function get_ws() {
  let page = 1;
  let ws_ids = [];
  while (true) {
    let res = await fetch(workspace_url(page), {
      method: 'GET',
    }).then((r) => r.json());

    for (let data of res.data) {
      ws_ids.push({
        key: data.attributes.name,
        url: 'https://app.terraform.io' + data.links['self-html'],
        icon: 'tf.png',
        type: 'tf,terraform',
        extra: data.id,
      });
    }

    if (!res.links.next) break;
    page += 1;
    await new Promise((r) => setTimeout(r, 1000));
  }

  return ws_ids;
}

function diff_years(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60 * 24;
  return Math.abs(Math.round(diff / 365.25));
}

async function get_repos() {
  let page = 1;
  let repos = [];
  let max_page = 10;
  let max_reqs = 15;
  while (true) {
    let res = await fetch(repo_url(page), {
      headers: {
        accept: 'application/json',
      },
      method: 'GET',
    }).then((r) => r.json());

    max_page = res.payload.pageCount;

    for (let data of res.payload.repositories) {
      if (diff_years(new Date(), new Date(data.lastUpdated.timestamp)) < 1.5)
        repos.push({
          key: data.name,
          url: `https://github.com/eqtpartners/${data.name}`,
          icon: 'gh.png',
          type: 'gh,git,github',
        });
    }

    if (
      res.payload.repositories.length === 0 ||
      max_page === page ||
      max_reqs === page
    )
      break;

    page += 1;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return repos;
}

export async function get_data() {
  let repos,
    ws = [];
  try {
    repos = await get_repos();
  } catch (e) {
    console.log(e);
  }
  try {
    ws = await get_ws();
  } catch (e) {
    console.log(e);
  }

  let curr = chrome.storage.local.get('urls');

  if (!curr.urls) {
    curr.urls = [];
  }

  if (repos === undefined || repos === null || !repos || repos.length === 0) {
    repos = curr.urls.filter((x) => x.type.includes('gh'));
  }

  if (ws === undefined || ws === null || !ws || ws.length === 0) {
    ws = curr.urls.filter((x) => x.type.includes('tf'));
  }

  return [].concat(ws, repos);
}
