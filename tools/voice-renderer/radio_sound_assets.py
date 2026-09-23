#!/usr/bin/env python3
"""Cache the small shared sound library; never regenerate an existing asset."""

import concurrent.futures
import json
import shutil
from pathlib import Path

import mix_radio_effects as sound
from radio_chunks import ROOT, OUTPUT, digest, encoded, save_new


def asset_one(asset_id, spec, key):
    folder = OUTPUT / "assets"
    folder.mkdir(parents=True, exist_ok=True)
    output = folder / f"{asset_id}.mp3"
    manifest_path = folder / f"{asset_id}.json"
    spec_hash = digest(encoded(spec))
    if manifest_path.exists():
        old = json.loads(manifest_path.read_text())
        if old["spec_sha256"] != spec_hash or old["sha256"] != digest(output.read_bytes()):
            raise ValueError(f"Cached asset differs: {asset_id}")
        return {"asset": asset_id, "status": "cached"}
    if output.exists() or (folder / f"{asset_id}.pending.json").exists():
        raise ValueError(f"Incomplete asset attempt needs inspection: {asset_id}")
    save_new(folder / f"{asset_id}.pending.json", {"asset_id": asset_id, "spec": spec})
    if "existing_path" in spec:
        origin = ROOT / spec["existing_path"]
        shutil.copy2(origin, output)
        metadata = {"status": "reused", "origin": str(origin)}
    else:
        effect = {"id": asset_id, **spec["generation"],
                  "loop": asset_id == "harbour_water_stone"}
        metadata = sound.generate_effect(effect, output, key)
    metadata.update({"asset_id": asset_id, "spec_sha256": spec_hash,
                     "spec": spec, "sha256": digest(output.read_bytes()),
                     "processing": "raw asset; new-asset normalization occurs only in the local mix cache"})
    save_new(manifest_path, metadata)
    return {"asset": asset_id, "status": metadata["status"]}


def main():
    plan = json.loads((ROOT / "stories/the-spare-room/adaptations/audio/render-plans/sv-sound-cues.json").read_text())
    key = sound.api_key()
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(asset_one, name, spec, key) for name, spec in plan["assets"].items()]
            for result in concurrent.futures.as_completed(futures):
                print(json.dumps(result.result()), flush=True)
    except Exception as error:
        raise RuntimeError(str(error).replace(key, "[REDACTED]")) from None


if __name__ == "__main__":
    main()
