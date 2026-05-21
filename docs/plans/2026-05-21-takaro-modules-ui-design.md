# Takaro Modules UI Design

## Goal

Make the community modules viewer feel like a Takaro product surface and make filtering easier to understand and use.

## Chosen Approach

Use a hybrid browser layout. Keep the left sidebar for module navigation, because the current detail pages and tests already depend on that structure. Add stronger Takaro branding and move the most important browsing context into clearer controls and summaries.

## Brand Direction

Match the current Takaro website style:

- Background: `#080808`
- Card background: `#151515`
- Hover background: `#1a1a1a`
- Border: `#222222`
- Accent: `#664DE5`
- Accent hover: `#7a5ef0`
- Radius: 8px for cards and controls

The viewer should use the Takaro name prominently in the sidebar header and home header. The copy should frame the app as the Takaro module library for server owners, not as a generic viewer.

## Filtering UX

Current filtering is spread across dense wrapped chips in the sidebar, while the home page also acts as category navigation. The new flow should make filter state visible and separate filter actions from category grouping:

- Show a clear search field with result counts.
- Use select controls for category, author, and supported game instead of many small wrapped buttons.
- Show active filters as a short summary with one reset action.
- Keep grouped module navigation below the filters.
- Keep category cards on the home page, but make them feel like curated entry points into the same filter system.

## Home Page

Replace the large card-like hero with a compact product header:

- Takaro Modules as the primary title.
- Supporting copy explaining that modules install through Takaro for game server automation, moderation, economy, Discord, and community features.
- Stats for total modules, categories, and supported games.
- Category cards with counts and short, utilitarian descriptions.

Avoid emoji-heavy category presentation. Use simple labels and count badges.

## Sidebar

The sidebar should become a calmer Takaro module browser:

- Header: Takaro wordmark plus "Modules".
- Result count: `Showing X of Y modules`.
- Search input.
- Filter selects for category, author, and game.
- Active filter summary and clear button.
- Grouped module list.

When collapsed, the sidebar may show a compact Takaro initial or module icon. Mobile behavior should remain drawer-based.

## Testing

Keep the existing behavior covered:

- Category cards on the home page still set the category filter.
- Sidebar filtering still narrows module groups.
- Search still finds modules by name, description, category, author, and game.
- Mobile sidebar still opens and closes.

Run formatting and focused tests after implementation.
