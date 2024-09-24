import { csvFormat } from "d3-dsv";

const topicsChunks = [];
const MAX_REQUESTS = 1000;
let i = 0;
let base_url = "https://talk.observablehq.com";
let path = "/latest";
while (path && i++ < MAX_REQUESTS) {
  const response = await fetch(base_url + path.replace("latest", "latest.json"));
  const json = await response.json();
  path = json.topic_list.more_topics_url;
  const newTopics = json.topic_list.topics
    .map((d) => ({
      id: d.id,
      posts_count: d.posts_count,
      created_at: d.created_at,
      last_posted_at: d.last_posted_at,
      views: d.views,
      like_count: d.like_count,
      category_id: d.category_id,
      has_accepted_answer: d.has_accepted_answer,
    }))
  topicsChunks.push(newTopics);
  if (!newTopics.length) {
    break;
  }
}

// Write out csv formatted data.
process.stdout.write(csvFormat(topicsChunks.flat()));
