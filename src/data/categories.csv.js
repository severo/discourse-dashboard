import { csvFormat } from "d3-dsv";

const url = "https://talk.observablehq.com/categories.json";
const response = await fetch(url);
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
