---
theme: dashboard
toc: false
---

# Observable Talk Dashboard

The forum, called [Observable Talk](https://talk.observablehq.com), is a place for the Observable community to connect and share.

<!-- Load and transform the data -->

```js
import * as d3 from "d3-array";
const posts = await FileAttachment("data/posts.csv").csv({typed: true});
const categoriesRaw = await FileAttachment("data/categories.csv").csv({typed: true});
//const topics = d3.rollup(posts, v => ({category_id: v[0].category_id, posts: v, users: new Set(v.map(d => d.username))}), d => d.topic_id)
const topics = await FileAttachment("data/topics.csv").csv({typed: true});
const users = new Set(posts.map(d => d.username));

const topicsByCategory = d3.rollup(topics, v => v.length, d => d.category_id);
const categories = categoriesRaw.map(d => ({...d, topics: topicsByCategory.get(d.id) || 0}));

const tenTopUsers = d3.rollups(posts, v => v.length, d => d.username).sort(
      (a, b) => d3.descending(a[1], b[1])
    ).slice(0, 10).map(d => ({
      username: d[0],
      posts: d[1]
    }));
    
const tenTopAcceptedUsers = d3.rollups(posts.filter(d => d.accepted_answer), v => v.length, d => d.username).sort(
      (a, b) => d3.descending(a[1], b[1])
    ).slice(0, 10).map(d => ({
      username: d[0],
      posts: d[1]
    }));
    
const intervals = {"month": "Month", "year": "Year", "day": "Day", "week": "Week"};
const interval  = "month"
const intervalLabel = intervals[interval];

const color = {
  users: "#e36209",
  posts: "#3b5fc0",
  accepted: "green"
}

const years = d3.extent(posts, d => d.created_at.getFullYear());
```


## Trends over time

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
<div class="card">
    <h2>Years</h2>
    <span class="big">${years[0]}—${years[1]}</span>
  </div>
  <div class="card">
    <h2>Topics</h2>
    <span class="big">${topics.length.toLocaleString("en-US")}</span>
    <p>Topics are the forum's questions, or threads.</p>
  </div>
  <div class="card">
    <h2>Posts</h2>
    <span class="big">${posts.length.toLocaleString("en-US")}</span>
    <p>The posts are comments in a thread, ie the answers to a question. The topics are not included.</p>
  </div>
  <!-- <div class="card">
    <h2>Posts per topic</h2>
    <span class="big">${(posts.length / topics.size).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}</span>
  </div>
  <div class="card">
    <h2>Users per topic</h2>
    <span class="big">${(d3.sum(topics, d => d[1].users.size) / topics.size).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}</span>
  </div> -->
  <!-- <div class="card">
    <h2>Categories</h2>
    <span class="big">${categories.length.toLocaleString("en-US")}</span>
  </div> -->
  <div class="card">
    <h2>Users</h2>
    <span class="big">${users.size.toLocaleString("en-US")}</span>
  </div>
</div>

<!-- Plot of monthly active users -->


```js
function postsMAU(data, {width} = {}) {
  return Plot.plot({
    title: `Monthly active users`,
    width,
    height: 300,
    y: {grid: true, label: `users`},
    // color: {...color, legend: true},
    marks: [
      Plot.lineY(data, Plot.binX({y: "distinct"}, {x: "created_at", y: "username", stroke: color.users, interval: "month", tip: true})),
      Plot.ruleY([0])
    ]
  });
}
```

<!-- Plot of posts history -->

```js
function postsTimeline(data, {width} = {}) {
  return Plot.plot({
    title: `Posts created every ${interval}`,
    width,
    height: 300,
    y: {grid: true, label: "posts"},
    // color: {...color, legend: true},
    marks: [
      Plot.lineY(data, Plot.binX({y: "count"}, {x: "created_at", stroke: color.posts, interval, tip: true})),
      Plot.ruleY([0])
    ]
  });
}
```

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => postsMAU(posts, {width}))}
  </div>
  <div class="card">
    ${resize((width) => postsTimeline(posts, {width}))}
  </div>
</div>

## Topics

<!-- Plot of topics per category -->

```js
function categoriesChart(data, {width}) {
  return Plot.plot({
    title: "Most active categories",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 150,
    x: {grid: true, label: "Topics"},
    y: {label: null},
    marks: [
      Plot.barX(data, {x: "topics", y: "name", fill: d=>"#"+d.color, tip: true, sort: {y: "-x"}}),
      Plot.ruleX([0])
    ]
  });
}
```

<!-- Posts per topic -->

```js
function answersPerTopicChart(data, {width}) {
  return Plot.plot({
    title: "Answers per topic",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 150,
    x: {grid: true, label: "Proportion (%)", percent: true},
    y: {label: "Answers", reverse: true},
    marks: [
      Plot.rectX(data, Plot.binY({x: "proportion"}, {y: {value: d => d.posts_count - 1, thresholds: d3.range(-0.5,10.5)}, fill: d => d.posts_count === 1 ? "#AAA": "#DDD", tip: true})),
      Plot.ruleX([0])
    ]
  });
}
```

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => categoriesChart(categories, {width}))}
  </div>
  <div class="card">
    ${resize((width) => answersPerTopicChart(topics, {width}))}
  </div>
</div>

## Users

<!-- Top users -->

```js
function topUsersChart(data, {width}) {
  return Plot.plot({
    title: "Top posters",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 150,
    x: {grid: true, label: "Posts"},
    y: {label: null},
    marks: [
      Plot.barX(data, {x: "posts", y: "username", fill: color.posts, tip: true, sort: {y: "-x"}}),
      Plot.ruleX([0])
    ]
  });
}
```


```js
function topAcceptedUsersChart(data, {width}) {
  return Plot.plot({
    title: "Users with most accepted answers",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 150,
    x: {grid: true, label: "Posts"},
    y: {label: null},
    marks: [
      Plot.barX(data, {x: "posts", y: "username", fill: color.accepted, tip: true, sort: {y: "-x"}}),
      Plot.ruleX([0])
    ]
  });
}
```

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => topUsersChart(tenTopUsers, {width}))}
  </div>
  <div class="card">
    ${resize((width) => topAcceptedUsersChart(tenTopAcceptedUsers, {width}))}
  </div>
</div>


Data: [Observable Talk](https://talk.observablehq.com) activity from ${d3.min(posts, d => d.created_at).getFullYear()} to ${d3.max(posts, d => d.created_at).getFullYear()} downloaded using the [Discourse API](https://docs.discourse.org/).
