#!/usr/bin/env node

// x-search — X (Twitter) Research CLI
// Dependencies: Node.js 18+ (built-in fetch)
// Auth: X_BEARER_TOKEN env var

const TOKEN = process.env.X_BEARER_TOKEN;
if (!TOKEN) {
  console.error('Error: X_BEARER_TOKEN is not set.');
  console.error('Set it in ~/.claude/settings.json:');
  console.error('  { "env": { "X_BEARER_TOKEN": "your-token" } }');
  process.exit(1);
}

const API = 'https://api.x.com/2';
const FIELDS = 'tweet.fields=created_at,public_metrics,author_id,conversation_id';
const EXPANSIONS = 'expansions=author_id';
const USER_FIELDS = 'user.fields=username,name,public_metrics';

// ---- API ----

async function api(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function sinceToISO(s) {
  const m = s.match(/^(\d+)([hd])$/i);
  if (!m) return s;
  const ms = m[1] * (m[2].toLowerCase() === 'h' ? 3600000 : 86400000);
  return new Date(Date.now() - ms).toISOString();
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

// ---- Format ----

function printTweets(data, includes, { sort = 'likes', limit = 15, minLikes = 0 } = {}) {
  if (!data?.length) { console.log('No tweets found.'); return; }

  const users = {};
  for (const u of includes?.users || []) users[u.id] = u.username;

  let tweets = data.filter(t => t.public_metrics.like_count >= minLikes);

  const key = { likes: 'like_count', impressions: 'impression_count', retweets: 'retweet_count' }[sort];
  if (key) tweets.sort((a, b) => (b.public_metrics[key] || 0) - (a.public_metrics[key] || 0));
  else tweets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  tweets.slice(0, limit).forEach((t, i) => {
    const m = t.public_metrics;
    const user = users[t.author_id] || 'unknown';
    console.log(`${i + 1}. @${user} (${fmt(m.like_count)}❤️  ${fmt(m.impression_count || 0)}👁  · ${ago(t.created_at)})`);
    console.log(`   ${t.text.replace(/\n/g, '\n   ').slice(0, 300)}`);
    console.log(`   https://x.com/${user}/status/${t.id}\n`);
  });

  console.log('---');
  console.log(`📊 ${data.length} tweets read · est. cost ~$${(data.length * 0.005).toFixed(3)}`);
}

// ---- Commands ----

async function search(query, opts = {}) {
  const { sort = 'likes', since = '7d', limit = 15, pages = 1, minLikes = 0, noReplies = false, quality = false } = opts;

  let q = `${query} -is:retweet`;
  if (noReplies) q += ' -is:reply';
  if (quality) q += ' min_faves:10';

  const sortOrder = sort === 'recent' ? 'recency' : 'relevancy';
  const startTime = sinceToISO(since);
  let allData = [], allUsers = [], nextToken = '';

  for (let p = 0; p < pages; p++) {
    let url = `/tweets/search/recent?query=${encodeURIComponent(q)}&max_results=100&${FIELDS}&${EXPANSIONS}&${USER_FIELDS}&sort_order=${sortOrder}&start_time=${startTime}`;
    if (nextToken) url += `&next_token=${nextToken}`;

    const res = await api(url);
    allData.push(...(res.data || []));
    allUsers.push(...(res.includes?.users || []));
    nextToken = res.meta?.next_token || '';
    if (!nextToken) break;
    if (p < pages - 1) await new Promise(r => setTimeout(r, 350));
  }

  printTweets(allData, { users: allUsers }, { sort, limit, minLikes: quality ? 10 : minLikes });
}

async function profile(username, limit = 10) {
  const userRes = await api(`/users/by/username/${username}?${USER_FIELDS},description`);
  const u = userRes.data;
  console.log(`👤 ${u.name} (@${username})`);
  console.log(`   Followers: ${fmt(u.public_metrics.followers_count)}`);
  if (u.description) console.log(`   ${u.description}`);
  console.log('');

  const q = `from:${username} -is:retweet`;
  const startTime = sinceToISO('7d');
  const fetchCount = Math.max(10, Math.min(100, limit));
  const res = await api(`/tweets/search/recent?query=${encodeURIComponent(q)}&max_results=${fetchCount}&${FIELDS}&${EXPANSIONS}&${USER_FIELDS}&start_time=${startTime}`);
  printTweets(res.data, res.includes, { sort: 'recent', limit });
}

async function tweet(id) {
  const res = await api(`/tweets/${id}?${FIELDS}&${EXPANSIONS}&${USER_FIELDS}`);
  printTweets([res.data], res.includes, { limit: 1 });
}

async function thread(id) {
  const root = await api(`/tweets/${id}?${FIELDS}&${EXPANSIONS}&${USER_FIELDS}`);
  const convId = root.data.conversation_id;
  const res = await api(`/tweets/search/recent?query=${encodeURIComponent(`conversation_id:${convId}`)}&max_results=100&${FIELDS}&${EXPANSIONS}&${USER_FIELDS}`);

  const allData = [root.data, ...(res.data || [])];
  const seen = new Set();
  const deduped = allData.filter(t => seen.has(t.id) ? false : (seen.add(t.id), true));
  deduped.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const allUsers = [...(root.includes?.users || []), ...(res.includes?.users || [])];
  printTweets(deduped, { users: allUsers }, { sort: 'recent', limit: 50 });
}

// ---- CLI ----

function parseArgs(args) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sort')       { opts.sort = args[++i]; }
    else if (args[i] === '--since') { opts.since = args[++i]; }
    else if (args[i] === '--limit') { opts.limit = Number(args[++i]); }
    else if (args[i] === '--pages') { opts.pages = Number(args[++i]); }
    else if (args[i] === '--min-likes') { opts.minLikes = Number(args[++i]); }
    else if (args[i] === '--no-replies') { opts.noReplies = true; }
    else if (args[i] === '--quality') { opts.quality = true; }
    else positional.push(args[i]);
  }
  return { positional, opts };
}

const HELP = `Usage: node x-search.mjs <command> [args]

Commands:
  search <query> [options]   Search recent tweets
  profile <username>         User's recent tweets
  tweet <id>                 Fetch a single tweet
  thread <id>                Fetch conversation thread

Search options:
  --sort likes|impressions|retweets|recent
  --since 1h|3h|12h|1d|3d|7d
  --limit N    --pages 1-5    --min-likes N
  --no-replies --quality`;

const [cmd, ...rest] = process.argv.slice(2);
const { positional, opts } = parseArgs(rest);

(async () => {
  try {
    switch (cmd) {
      case 'search':  await search(positional[0], opts); break;
      case 'profile': await profile(positional[0], opts.limit); break;
      case 'tweet':   await tweet(positional[0]); break;
      case 'thread':  await thread(positional[0]); break;
      default: console.log(HELP);
    }
  } catch (e) { console.error(e.message); process.exit(1); }
})();
