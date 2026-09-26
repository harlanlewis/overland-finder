/**
 * A vehicle's id is derived from its identity: make, model, trim and the
 * first model year of the entry, e.g. "ford-bronco-badlands-2021".
 *
 * Deriving it means the id always names the vehicle it points at, and two
 * entries with the same make, model, trim and first year get the same id,
 * which the validator rejects.
 * Change a vehicle's identity fields and its id changes with them: rename the
 * key in every scripts/*.json data file in the same commit.
 */

function slug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function vehicleId({ make, model, trim, yearStart }) {
  return [make, model, trim, yearStart]
    .filter(part => part !== null && part !== undefined && part !== "")
    .map(slug)
    .join("-");
}
