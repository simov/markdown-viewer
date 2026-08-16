# Comments

Attach comments to any selected text in a rendered markdown document. Comments
are anchored to the selected passage and highlighted inline; a sidebar panel
lists them all, filterable and searchable.

## Enabling

Two independent settings under Content Options:

| Setting | Default | Effect |
| :- | :-: | :- |
| **Show comments** | `true` | Renders highlights on anchored text and lets you open the sidebar to browse existing comments. Read-only — no way to create, edit, or delete anything. |
| **Create comments** | `false` | Adds everything needed to author comments: the selection tooltip, `Cmd/Ctrl+Shift+K`, the right-click "Add Comment" context menu item, and every mutating sidebar action (reply, edit, resolve, delete, import, Resolve All, Delete All). Has no visible effect if *Show comments* is off. |

New installs default to view-only (`Show comments` on, `Create comments`
off). Users upgrading from a version where comments were already fully
enabled keep write access automatically — the migration sets `Create
comments` to `true` for anyone who already had the old single `comments`
setting on, so existing workflows aren't broken by the split.

## Using it

With **Create comments** enabled:

- Select text in the rendered document → a tooltip appears near the
  selection → click it, or press `Cmd/Ctrl+Shift+K`, to open the comment
  input.
- Right-click a selection for an "Add Comment" context menu item.
- `Cmd/Ctrl+Enter` saves, `Escape` cancels, while writing a comment, reply,
  or edit.
- Each comment can be given an optional **tag** (`note`, `question`,
  `suggestion`, `issue`, `outdated`, `action-needed`) and an optional
  **severity** (`low`, `medium`, `high`, `critical`), rendered as pills in
  the sidebar.
- Comments can be **resolved** (strikethrough, dimmed) and reopened
  individually, or in bulk via **Resolve All** / **Delete All** in the
  sidebar header — both prompt for confirmation before acting.
- **Reply** to a comment to start a thread; replies show author and
  timestamp, indented under the parent.
- **Suggestion mode**: propose replacement text for the selected passage;
  the sidebar renders it as a strikethrough/insert diff.

With just **Show comments** enabled (or as a read-only viewer of someone
else's comments):

- Highlighted passages are visible and clickable.
- `Ctrl+]` / `Ctrl+[` jump to the next/previous comment in document order,
  scrolling the page and flashing the corresponding sidebar entry.
- Clicking outside the sidebar closes it.
- Comments can still be exported (JSON or Markdown) — export is
  non-destructive and available in both modes.

## Storage & persistence

Comments are stored in `chrome.storage.local`, keyed by page URL — not in a
sidecar file on disk and not via native messaging. There is no additional
permission required beyond what the extension already has for local file
access.

On load, comments come from two sources that get merged:

1. **Stored comments** — whatever was previously saved for this URL.
2. **Inline comments** — parsed from HTML comment markers embedded directly
   in the markdown source:

   ```html
   <!-- COMMENT: This is a comment -->
   <!-- COMMENT [RESOLVED]: This one is already resolved -->
   ```

   These are picked up from the rendered `<pre>` (raw view) or, on `file://`
   pages where that's unavailable, re-fetched from the source file. Inline
   comments let you seed or share comments by committing them directly into
   the markdown file — see [Export as Markdown](#export) below.

Stored comments take priority on merge; inline-only comments (not already in
storage) are added, deduplicated by ID and by anchor+body.

## Anchoring

Each comment anchors to a passage using the selected text plus a small
amount of surrounding context (up to ~100 characters before, ~50 after, cut
at paragraph boundaries) and the nearest preceding heading, so that minor
edits elsewhere in the document don't break the anchor. If the anchor text
can no longer be found in the current rendering, the comment still appears
in the sidebar, flagged as an orphan.

Anchors that span more than one inline element (for example, a selection
that starts in plain text and continues into a `<code>` or `<a>`) are
highlighted by wrapping each affected text node individually, rather than
requiring the whole selection to sit inside one DOM node.

Highlights are automatically reapplied if the underlying rendered content
is replaced — for example after autoreload picks up a file change, or after
switching themes or toggling the raw view.

## Import / Export

- **Export as JSON** — the full comment set for the current page, suitable
  for backup or hand-off to another viewer/session.
- **Export as Markdown** — writes the current comments back into the
  document as `<!-- COMMENT: ... -->` / `<!-- COMMENT [RESOLVED]: ... -->`
  markers near their anchored text, producing a `.commented.md` file. This
  is the round-trip mechanism for sharing comments as part of the document
  itself (e.g. committing them to a git repo) rather than as separate
  storage.
- **Import** (write mode only) — load a previously exported JSON file back
  into the current page's comment set.

All comment data — whether loaded from storage, parsed from inline markers,
or imported from JSON — is validated against an allowlist before being
trusted: tags and severities must match a fixed known set, IDs must match
`[\w-]+`, and text fields are length-capped. Nothing from an untrusted
source is rendered as raw HTML.

## Keyboard reference

| Shortcut | Context | Action |
| :- | :- | :- |
| `Cmd/Ctrl+Shift+K` | Text selected, write mode | Open comment input for the selection |
| `Cmd/Ctrl+Enter` | Comment/reply/edit box focused | Save |
| `Escape` | Comment/reply/edit box focused | Cancel |
| `Ctrl+]` | Anywhere | Jump to next comment |
| `Ctrl+[` | Anywhere | Jump to previous comment |
