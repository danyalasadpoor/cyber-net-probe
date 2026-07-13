import fs from "fs";

const input = "./data-import/domains.txt";
const output = "./src/data/targets-source.json";

const lines = fs
  .readFileSync(input, "utf8")
  .split(/\r?\n/)
  .map(x => x.trim())
  .filter(Boolean);


const targets = lines.map(domain => ({
  name: domain,
  address: `https://${domain}`,
  category: "website",
  tags: "",
  notes: ""
}));


fs.writeFileSync(
  output,
  JSON.stringify(
    targets,
    null,
    2
  ),
  "utf8"
);


console.log(
  `Converted ${targets.length} domains`
);
