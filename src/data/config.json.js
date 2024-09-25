import { DEFAULT_DISCOURSE_URL } from "../components/constants.js";

const discourse_url = process.env.DISCOURSE_URL || DEFAULT_DISCOURSE_URL;

const config = {
    discourse_url
}

// Write out json formatted data.
process.stdout.write(JSON.stringify(config));
