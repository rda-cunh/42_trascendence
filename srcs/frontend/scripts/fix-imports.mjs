import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/app");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const replacements = [
  [/from "\.\.\/\.\.\/types"/g, 'from "@/app/core/types"'],
  [/from "\.\.\/types\/chat"/g, 'from "@/app/core/types/chat"'],
  [/from "\.\.\/types"/g, 'from "@/app/core/types"'],
  [/from "\.\.\/\.\.\/lib\//g, 'from "@/app/core/lib/'],
  [/from "\.\.\/lib\//g, 'from "@/app/core/lib/'],
  [/from "\.\.\/\.\.\/contexts\//g, 'from "@/app/core/contexts/'],
  [/from "\.\.\/contexts\//g, 'from "@/app/core/contexts/'],
  [/from "\.\.\/hooks\/useAsyncEffect"/g, 'from "@/app/core/hooks/useAsyncEffect"'],
  [/from "\.\.\/utils\/constants"/g, 'from "@/app/shared/utils/constants"'],
  [/from "\.\.\/utils\/validators"/g, 'from "@/app/shared/utils/validators"'],
  [/from "\.\.\/utils\/helpers"/g, 'from "@/app/shared/utils/helpers"'],
];

const fileOverrides = {
  "features/products/pages/SellerProfile.tsx": [
    [/from "\.\.\/components\/UserAvatar"/g, 'from "@/app/shared/components/UserAvatar"'],
    [/from "\.\.\/components\/ProductCard"/g, 'from "../components/ProductCard"'],
  ],
  "features/profile/pages/Profile.tsx": [
    [/from "\.\.\/components\/ProductCard"/g, 'from "@/app/features/products/components/ProductCard"'],
    [/from "\.\.\/components\/UserAvatar"/g, 'from "@/app/shared/components/UserAvatar"'],
    [/from "\.\.\/hooks\/useImageUpload"/g, 'from "@/app/features/listings/hooks/useImageUpload"'],
  ],
  "features/listings/pages/SellItem.tsx": [
    [/from "\.\.\/components\/ShaderPreview"/g, 'from "@/app/features/products/components/ShaderPreview"'],
    [/from "\.\.\/hooks\/useImageUpload"/g, 'from "../hooks/useImageUpload"'],
  ],
  "features/listings/pages/EditListing.tsx": [
    [/from "\.\.\/components\/ShaderPreview"/g, 'from "@/app/features/products/components/ShaderPreview"'],
    [/from "\.\.\/hooks\/useImageUpload"/g, 'from "../hooks/useImageUpload"'],
  ],
  "features/products/pages/ProductDetail.tsx": [
    [/from "\.\.\/components\/ProductChatWidget"/g, 'from "@/app/features/chat/components/ProductChatWidget"'],
  ],
  "features/checkout/pages/Checkout.tsx": [
    [/from "\.\.\/components\/figma\/ImageWithFallback"/g, 'from "@/app/shared/components/figma/ImageWithFallback"'],
  ],
  "features/products/components/ListingPreview.tsx": [
    [/from "\.\/figma\/ImageWithFallback"/g, 'from "@/app/shared/components/figma/ImageWithFallback"'],
  ],
  "features/cart/components/Cart.tsx": [
    [/from "\.\/figma\/ImageWithFallback"/g, 'from "@/app/shared/components/figma/ImageWithFallback"'],
  ],
  "shared/components/Header.tsx": [
    [/from "\.\/Cart"/g, 'from "@/app/features/cart/components/Cart"'],
  ],
  "features/admin/pages/Dashboard.tsx": [
    [/from "\.\/dashboardData"/g, 'from "../dashboardData"'],
  ],
};

for (const file of walk(appDir)) {
  const rel = path.relative(appDir, file).replace(/\\/g, "/");
  let content = fs.readFileSync(file, "utf8");

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  const overrides = fileOverrides[rel];
  if (overrides) {
    for (const [pattern, replacement] of overrides) {
      content = content.replace(pattern, replacement);
    }
  }

  fs.writeFileSync(file, content);
}

console.log("Fixed imports in", walk(appDir).length, "files");
