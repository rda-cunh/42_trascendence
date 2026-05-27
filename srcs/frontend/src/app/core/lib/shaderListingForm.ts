import { slugifyShaderTitle } from "./shaders";

export const MAX_SHADER_PRICE = 100000;

export type ShaderListingFormData = {
  title: string;
  price: string;
  code: string;
};

export function getShaderListingSlug(title: string) {
  return slugifyShaderTitle(title);
}

export function getShaderListingValidationError({
  title,
  price,
  code,
  slug,
}: ShaderListingFormData & { slug: string }) {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 3) {
    return "Title must be at least 3 characters long";
  }

  if (!slug || slug.length < 3) {
    return "Title must contain letters or numbers to generate a valid slug";
  }

  const parsedPrice = Number.parseFloat(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return "Price must be higher than zero";
  }

  if (parsedPrice > MAX_SHADER_PRICE) {
    return `Price must be ${MAX_SHADER_PRICE} or less`;
  }

  if (!code.includes("void main")) {
    return "Shader source must include a void main function";
  }

  return null;
}
