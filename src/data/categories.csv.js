import { csvFormat } from "d3-dsv";
import { DEFAULT_DISCOURSE_URL } from "../components/constants.js";
import {fetchAndRetry} from "../components/fetch-and-retry.js";

const discourse_url = process.env.DISCOURSE_URL || DEFAULT_DISCOURSE_URL;

const url = discourse_url + "/categories.json";
const response = await fetchAndRetry(url);
const json = await response.json();
const categories = json.category_list.categories.map((d) => ({
  id: d.id,
  name: d.name,
  color: d.color,
  // description: d.description,
  // description_text: d.description_text,
  // subcategory_ids: d.subcategory_ids,
}));

// Write out csv formatted data.
process.stdout.write(csvFormat(categories));
