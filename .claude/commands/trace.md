Trace how the idea **"$ARGUMENTS"** has evolved across the Obsidian vault.

## Steps

Follow these steps in order. Use Bash tool calls throughout.

### 1. Locate the vault

Find the Obsidian vault root. Check these locations in order and use the first one that exists:
- `~/obsidian`
- `~/Obsidian`
- `~/Documents/Obsidian`
- `~/notes`
- `~/Notes`
- `~/vault`

Run: `ls ~ | grep -iE 'obsidian|vault|notes'` to discover non-standard locations.
If multiple vaults exist (`.obsidian` config dir inside a folder), list them and pick the most recently modified.
Store the vault path as VAULT.

### 2. Search for all mentions

Run a case-insensitive search for `$ARGUMENTS` across all markdown files in VAULT:

```bash
grep -rli --include="*.md" "$ARGUMENTS" "$VAULT"
```

Also search for close variants (partial matches, plural forms):

```bash
grep -rli --include="*.md" -E "$ARGUMENTS" "$VAULT" 2>/dev/null
```

Collect all unique matching file paths.

### 3. Extract dates for each matching file

For each matching file, gather:

a) **Frontmatter date** — look for `date:`, `created:`, or `modified:` in the YAML front matter (first lines between `---` delimiters).

b) **File modification time**:
```bash
stat -c "%y %n" "<file>"
```

c) **Git history** (if the vault is a git repo):
```bash
git -C "$VAULT" log --follow --format="%ai %s" -- "<relative-path>"
```
The earliest git commit date is the creation date; subsequent commits show edits.

If no dates are found, fall back to `stat -c "%w %n"` (birth time) then `%y` (mtime).

### 4. Follow backlinks and outgoing links

For each matching file, extract all `[[wikilinks]]` and `[[wikilinks|aliases]]`:

```bash
grep -oP '\[\[([^\]|]+)' "<file>" | sed 's/\[\[//'
```

Then check which of those linked notes also mention `$ARGUMENTS`:

```bash
grep -li --include="*.md" "$ARGUMENTS" <linked-files>
```

Also find backlinks — notes that link TO each matching file:

```bash
grep -rli --include="*.md" "\[\[<notename>" "$VAULT"
```

Build a map of: `note → [outgoing links that mention topic] + [backlinks that mention topic]`

### 5. Extract key excerpts

For each matching file, pull the 1–3 most relevant lines (the sentence containing `$ARGUMENTS` plus one line of context):

```bash
grep -n -i -A1 -B1 "$ARGUMENTS" "<file>" | head -20
```

Also check for any headings (`## `, `### `) near the match to understand the context section.

### 6. Build the timeline

Sort all files by their earliest determined date. Then output the following report:

---

## Idea Evolution: "$ARGUMENTS"

**First appearance:** `<date>` in `<file>`
**Total notes:** `<count>` | **Connection depth:** `<max backlink hops>`

---

### Timeline

For each note in chronological order:

```
📅 <DATE>  <note-name> (<relative-path>)
   Context: "<relevant excerpt — 1–2 sentences>"
   Links to: [[note-a]], [[note-b]]
   Linked from: [[note-x]]
```

---

### Connection Map

List the hub notes (notes with the most links to/from other topic notes) and show the relationship graph as ASCII or a bullet tree:

```
<central-note>
  ├── [[linked-note-1]]  (date)
  ├── [[linked-note-2]]  (date)
  └── [[linked-note-3]]  (date)
        └── [[deeper-note]]  (date)
```

---

### Evolution Summary

Write a short narrative (3–5 sentences) describing:
- When and where the idea first appeared
- How it developed or changed across notes (look for shifts in framing, new sub-topics, resolved questions)
- What it's most connected to today (the notes with the most recent links)

---

### Notes Searched

| Date | File | Excerpt |
|------|------|---------|
| ... | ... | ... |

---

If no files are found for `$ARGUMENTS`, say so clearly and suggest:
1. Alternative search terms the user might try
2. Whether any notes mention related concepts (do a broader fuzzy search with `grep -ri` on individual words from the topic)
