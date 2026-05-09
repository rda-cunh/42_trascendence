import { Listing, ShaderMetadata } from "../types";

const SHADER_DESCRIPTION_MARKER = "__PROJECT_SHADER_V1__";

export const DEFAULT_FRAGMENT_SHADER = `uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;
  vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx * 6.28318 + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(color, 1.0);
}`;

interface EncodedShaderDescription {
  type: "shader";
  version: 1;
  language: "glsl";
  notes: string;
  code: string;
}

export function buildShaderDescription(notes: string, code: string) {
  const payload: EncodedShaderDescription = {
    type: "shader",
    version: 1,
    language: "glsl",
    notes: notes.trim(),
    code,
  };

  return `${SHADER_DESCRIPTION_MARKER}\n${JSON.stringify(payload)}`;
}

export function parseShaderDescription(
  description: string | null | undefined
): ShaderMetadata | null {
  if (!description?.startsWith(SHADER_DESCRIPTION_MARKER)) return null;

  try {
    const payload = JSON.parse(
      description.slice(SHADER_DESCRIPTION_MARKER.length).trim()
    ) as Partial<EncodedShaderDescription>;

    if (payload.type !== "shader" || payload.version !== 1 || typeof payload.code !== "string") {
      return null;
    }

    return {
      code: payload.code,
      notes: typeof payload.notes === "string" ? payload.notes : "",
      language: "glsl",
    };
  } catch {
    return null;
  }
}

export function getListingDescription(listing: Listing) {
  return listing.shader?.notes || listing.description;
}

export function isShaderListing(listing: Listing): listing is Listing & { shader: ShaderMetadata } {
  return listing.category === "Shaders" && Boolean(listing.shader?.code);
}

export function slugifyShaderTitle(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `shader-${Date.now()}`;
}
