import { csvFormat } from "d3-dsv";
import setup from "./setup.json" with { type: "json" };

const postsChunks = [];
const MAX_REQUESTS = 100;
let before = undefined;
let i = 0;
while (i++ < MAX_REQUESTS) {
  const url =
    setup.base_url + "/posts.json" + (before
      ? "?" + new URLSearchParams({
          before,
        }).toString()
      : "");
  const response = await fetch(url);
  const json = await response.json();
  const newPosts = json.latest_posts
    .map((d) => ({
      id: d.id,
      topic_id: d.topic_id,
      username: d.username,
      avatar_template: d.avatar_template,
      created_at: d.created_at,
      incoming_link_count: d.incoming_link_count,
      reads: d.reads,
      category_id: d.category_id,
      accepted_answer: d.accepted_answer,
    }))
    .filter((d) => d.id !== before);
  postsChunks.push(newPosts);
  if (!newPosts.length) {
    break;
  }
  before = newPosts[newPosts.length - 1].id;
}

// Write out csv formatted data.
process.stdout.write(csvFormat(postsChunks.flat()));
