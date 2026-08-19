import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The `const [mounted, setMounted] = useState(false); useEffect(() =>
      // setMounted(true), [])` idiom is used across the app to render client-only
      // state (cart count, persisted stores) only after hydration and avoid
      // hydration mismatches. That is the intended use here, so keep it a warning
      // rather than a build-failing error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
