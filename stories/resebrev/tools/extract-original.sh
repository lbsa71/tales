#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-/Users/stefan/Documents/Source/lbsa71/lbsa71.net/data/lbsa71.export.json}"
DEST="${2:-stories/resebrev/original}"

mkdir -p "$DEST/items" "$DEST/markdown"

jq -s '
  def zpad3: tostring | ("000" + .)[-3:];
  def attr:
    if has("S") then .S
    elif has("NULL") then null
    elif has("N") then .N
    elif has("BOOL") then .BOOL
    elif has("L") then [.L[] | attr]
    elif has("M") then .M | with_entries(.value |= attr)
    else .
    end;

  [
    .[]
    | .Item as $raw
    | select($raw.playlist.S? == "Resebrev")
    | {
        user_id: $raw.user_id.S,
        document_id: $raw.document_id.S,
        playlist: $raw.playlist.S,
        ordinal: $raw.ordinal.S,
        title: (($raw.content.S // "") | split("\n")[0] | sub("^# *"; "")),
        content: ($raw.content.S // ""),
        media_item: ($raw.media_item | attr),
        hero_img: ($raw.hero_img | attr),
        raw: $raw
      }
  ]
  | sort_by(.ordinal, .document_id)
  | to_entries
  | map(.value + {
      index: (.key + 1),
      basename: (((.key + 1) | zpad3) + "_" + .value.ordinal + "_" + .value.document_id)
    })
' "$SOURCE" > "$DEST/resebrev.json"

jq '[.[] | {
  index,
  document_id,
  ordinal,
  title,
  playlist,
  user_id,
  markdown_file: ("markdown/" + .basename + ".md"),
  raw_item_file: ("items/" + .basename + ".json"),
  chars: (.content | length)
}]' "$DEST/resebrev.json" > "$DEST/manifest.json"

jq -r '.[] | [.basename, .content] | @base64' "$DEST/resebrev.json" |
while read -r row; do
  basename="$(printf '%s' "$row" | base64 --decode | jq -r '.[0]')"
  printf '%s' "$row" | base64 --decode | jq -rj '.[1]' > "$DEST/markdown/$basename.md"
done

jq -r '.[] | [.basename, .raw] | @base64' "$DEST/resebrev.json" |
while read -r row; do
  basename="$(printf '%s' "$row" | base64 --decode | jq -r '.[0]')"
  printf '%s' "$row" | base64 --decode | jq '.[1]' > "$DEST/items/$basename.json"
done

jq -r '[
  "# Resebrev Original",
  "",
  "Extraherat från `" + "'"$SOURCE"'" + "`.",
  "",
  ("Antal brev: " + (length | tostring)),
  "",
  "| # | Datum | Dokument | Titel | Tecken |",
  "|---:|---|---|---|---:|",
  (.[] | "| " + (.index | tostring) + " | " + .ordinal + " | " + .document_id + " | " + (.title | gsub("\\|"; "\\|")) + " | " + (.content | length | tostring) + " |")
] | .[]' "$DEST/resebrev.json" > "$DEST/README.md"

echo "Extracted $(jq 'length' "$DEST/resebrev.json") resebrev to $DEST"
