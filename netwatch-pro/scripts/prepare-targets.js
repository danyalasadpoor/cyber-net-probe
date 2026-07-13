import fs from "fs";

const input =
  "./src/data/targets-source.json";

const output =
  "./src/data/targets.json";


const data =
  JSON.parse(
    fs.readFileSync(input, "utf8")
  );


if (!Array.isArray(data)) {
  throw new Error(
    "targets-source.json must be an array"
  );
}


const result =
  data
    .filter(
      item =>
        item.address ||
        item.url ||
        item.host
    )
    .map(
      (item, index) => ({
        name:
          item.name ||
          item.host ||
          item.address ||
          `Target ${index + 1}`,

        address:
          item.address ||
          item.url ||
          item.host,

        category:
          item.category ||
          "general",

        tags:
          item.tags ||
          "",

        notes:
          item.notes ||
          ""
      })
    );


fs.writeFileSync(
  output,
  JSON.stringify(
    result,
    null,
    2
  ),
  "utf8"
);


console.log(
  `Prepared ${result.length} targets`
);
