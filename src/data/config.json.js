import { DEFAULT_BASE_URL } from "../components/constants.js";

const base_url = process.env.BASE_URL || DEFAULT_BASE_URL;

const config = {
    base_url
}

// Write out json formatted data.
process.stdout.write(JSON.stringify(config));
