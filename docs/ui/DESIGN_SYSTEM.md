# Web Radar application UI

Adopted foundation: `radar-ui-foundation-v1` (2026-10-14).
Reference application: Product Radar, source baseline `5134c31bd55d376921870c5d8638373d812fbe3e`.
The shared contract is Product Radar's `docs/ui/FAMILY_UI_FOUNDATION.md`; its authoritative values and responsive composition are in `src/client/design-system.css`, `src/client/application-ui.css`, and the Foundation / Shared composition sections of `docs/ui/DESIGN_SYSTEM.md`.

## Ownership and reuse

Web Radar keeps its existing React frontend and CSS. There is no cross-repository runtime or build dependency. [radar-ui.css](../../src/client/radar-ui.css) owns the `--radar-*` foundation and application composition. [application-controls.css](../../src/client/application-controls.css), imported after it by `main.tsx`, owns ordinary `.button` / Outreach `.btn` variants and native field appearance, focus and mobile sizing. These existing aliases share one presentation definition; their elements, events and disabled conditions stay unchanged. Legacy variables such as `--paper`, `--ink`, `--forest`, and `--line` alias the foundation. Outreach maps its existing `--color-*`, `--radius-*`, and `--font-sans` variables to it in `src/outreach/client/styles/workbench.css`, loaded after `index.css`. Its former duplicated control definitions have been removed, so later lazy loading cannot restore an old control theme.

| Role | Adopted value |
| --- | --- |
| Font | Avenir Next, PingFang SC, Microsoft YaHei, Segoe UI, sans-serif |
| Page / section / card heading | 28px / 20px / 16px; page heading 24px at 768px and below |
| Body / control / supporting text | 14px / 14px / 12px |
| Heading / body line height | 1.35 / 1.65 |
| Regular / medium / semibold | 400 / 550 / 650 |
| Spacing | 4, 8, 12, 16, 24, 32, 40px |
| Control minimum | 40px desktop; 44px at 768px and below |
| Mobile input / select / textarea | 16px; native date controls retain 14px; buttons retain 14px |
| Control / panel / dialog radius | 8px / 12px / 16px |
| Page gutter / content maximum | 32px desktop, 16px mobile / 1680px; administration 1440px |
| App / surface / subtle | #f6f6fa / #ffffff / #faf9fc |
| Text / secondary / muted | #292338 / #71657f / #86798f |
| Border / stronger border | #e8e4ef / #d7cfe2 |
| Primary / hover / soft / border | #7151df / #6140ce / #f0ebfb / #e1d7f5 |
| Success / warning / danger | #2f8a57 / #b7791f / #d14343 |

Use the existing `Button`, `Field`, `SectionTitle`, `Modal`, `.page-heading`, `.panel`, `.project-list-heading`, and `.management-filters` composition. `Button` already supplies primary, secondary, quiet, danger, disabled and loading states. Navigation/download anchors retain their element, `href`, `target`, `rel`, and existing `.button` variant. Do not replace them with click-only controls. Outreach retains its existing `.btn`, form and toolbar components. Heading/action rows and filter/footer toolbars wrap; dense tables retain local horizontal scrolling.

## Adoption scope

| Surface | Maintained style entry |
| --- | --- |
| Login, workspace navigation, project list, website editor controls, admin/services, ordinary dialogs and private preview toolbar | `src/client/radar-ui.css`; `TemplateSelector.tsx` delegates card heading presentation to this stylesheet |
| Channel dashboard | `src/client/dashboard.css` |
| CRM filters, activity panels, tables and profile chrome | `src/client/customer-management.css` |
| Inbox list, configuration and message surrounding controls | `src/client/inbox.css` |
| EDM/online-send navigation, forms, toolbars, ordinary panels/dialogs, recipient/template selectors | `src/outreach/client/styles/index.css`, `workbench.css`, `edm-workbench.css`, `site-workbench.css` |
| Guided assistant surrounding controls | `src/outreach/client/assistant/assistant.css` |
| Clone editor ordinary fields, actions and mobile URL row | `src/client/application-controls.css`, `clone-editor.css`; `CloneEditor.tsx` delegates former inline control appearance to these styles |
| Contacts and import-report filters; contact/group and edit-campaign form grids | Opt-in `.radar-filter-toolbar`, `.radar-filter-actions`, `.radar-filter-field`, `.radar-form-grid` in `src/outreach/client/styles/workbench.css` |

This is application presentation adoption. It does not change events, routes, parameters, validation, permissions, quotas, requests, save/generation/send/publication behavior, or dialog dismissal rules. No backend or component behavior changes are required.

Customer-generated websites, template mockup artwork/canvases, email HTML and Quill content/preview, CRM message content, report/PDF output and images retain their existing themes. Their surrounding application controls adopt the foundation. Data visualization palettes, status distinctions, compact metadata, thumbnails, and content-dependent editor/table widths remain deliberate local styles. Product Radar's image revision/comparison implementation belongs to its separate workflow owner.

Ordinary field rules target `input`, `select` and `textarea` by element. A template-picker trigger implemented as `button.form-select` keeps the 14px button role on phones. Quill document descendants and the assistant's custom composer retain their document/composer styles; native checkboxes, radios, color and file controls retain their specialized sizing. Search indentation, select chevrons, textarea dimensions and workflow-specific form grids remain locally owned.

Contact and import-report filter toolbars share opt-in wrapping and spacing. At 768px and below their fields use two columns, then one at 440px; actions and counts wrap in their existing order. Three contact/group grids and the two equivalent edit-campaign sender/reply grids use `.radar-form-grid`: two desktop columns and one at 768px and below. Search icon indentation and table-local horizontal scrolling remain intact. Other editor, sender/domain, template, recipient-picker and wizard grids retain their own column/full-width semantics; do not apply this layout to them merely because they also contain fields.

## Synchronization and verification

For a future Product Radar foundation update, review the shared contract and the two reference CSS files at the new source commit. Update Web Radar's foundation values and local aliases first, then only the affected module selectors. Record the new foundation version, source commit and changed adoption scope here. Do not copy Product Radar workflow logic or introduce a shared runtime package to synchronize presentation.

Validate the affected application at 1280px and 390px. Inspect wrapping, keyboard focus, computed control sizes and document overflow, including existing empty, populated, disabled and loading states. Exercise relevant navigation, filters, form values and dialog dismissal with isolated fixtures; keep content previews independent. Run the required type/build checks and relevant existing client regressions. Local fixture acceptance does not establish authenticated production behavior or deployment.
