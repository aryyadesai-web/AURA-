# UI source notes

AURA uses Watermelon UI's `card` registry item as an editable, local source primitive at `src/components/ui/card.tsx`. The module preserves its `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, and `CardFooter` slot API and the original Tailwind slot classes. The only path adjustment is the local `cn` helper, implemented in `src/lib/utils.ts` to avoid adding a class-merging dependency.

The project was initialized as a Vite React app and Tailwind CSS v4 uses its first-party Vite plugin, as configured by Watermelon UI's current shadcn-compatible registry approach. The source is from `https://registry.watermelon.sh/r/card.json`, inspected on 2026-10-28. Watermelon UI's current CLI install convention is `npx shadcn@latest add https://registry.watermelon.sh/r/<name>.json`; AURA keeps the copied code directly in this Vite project rather than requiring the registry at runtime.

The catalog's `card-split-accordian` source uses `motion`, `react-icons`, and `react-use-measure`. That interaction is not required for AURA; light CSS transitions are used rather than adding those packages. The dashboard itself is original, with charting drawn using SVG and lucide-react icons.
