declare module "virtual:hm-versions" {
  /** The reviewed suite release and the versions it pins, from data/versions.json. */
  const versions: { suite: string; versions: Record<string, string | null> };
  export default versions;
}
