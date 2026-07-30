Add a search/filter bar to the Clients list page (app/clients/page.tsx or wherever the list renders).

Requirements:
1. A text input at the top of the page, above the client list, placeholder "Search clients...". Style it to match existing input conventions used elsewhere in the app (same border/padding/font as other text inputs).
2. Client-side filtering only — no new server query needed. Fetch clients as already done, then filter the already-fetched array in a client component based on the search input's current value.
3. Filter should match against name, company_name, phone, and email (case-insensitive substring match) — a client typing "jimmy" should match a client named Jimmy or a client whose email contains "jimmy".
4. This needs a client component wrapping the list (since filtering happens interactively in the browser) — the page itself can stay a server component for the initial fetch, but the list + search input should be extracted into a client component that receives the full client list as a prop and manages the filtered view with useState.
5. If the filter produces zero matches, show a simple "No clients match your search" message instead of an empty list.
6. Keep the "+ Add client" button and its position exactly as-is — search input and sort control go above the list, don't restructure the header.

7. Add a sort dropdown next to the search input, with these options: "Name A–Z" (default), "Name Z–A", "Company A–Z", "Company Z–A", "Newest first", "Oldest first". "Newest first" sorts by created_at descending, "Oldest first" ascending. Sorting applies to the filtered list (filter first, then sort), and both live in the same client component's state.

Not in scope for this pass: pagination or server-side search/sort. This is purely client-side filtering and sorting of the already-fetched list — the right amount of complexity for the current client volume, revisit if/when the client count grows into the thousands.
