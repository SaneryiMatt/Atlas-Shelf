import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceRoot = path.resolve(process.cwd(), "src");
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function resolveCandidate(basePath) {
  for (const extension of extensions) {
    const directPath = `${basePath}${extension}`;
    if (existsSync(directPath)) {
      return directPath;
    }
  }

  for (const extension of extensions) {
    const indexPath = path.join(basePath, `index${extension}`);
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolvedPath = resolveCandidate(path.join(sourceRoot, specifier.slice(2)));

    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href
      };
    }
  }

  return nextResolve(specifier, context);
}
