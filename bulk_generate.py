"""
VendMieux — Bulk scenario generation script (v2 — parallel).
Calls POST /api/scenarios/generate for each scenario in scenarios_240.json.
Uses local checkpoint file to track progress (not DB ID matching).
Runs 5 concurrent requests via asyncio semaphore.
"""
import json
import asyncio
import time
import sys
from pathlib import Path

sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

import httpx

CHECKPOINT_FILE = Path("/root/vendmieux/bulk_checkpoint.json")
SCENARIOS_FILE = Path("/root/vendmieux/scenarios_240.json")
CONCURRENCY = 5  # 5 parallel requests


def load_checkpoint() -> set:
    if CHECKPOINT_FILE.exists():
        return set(json.loads(CHECKPOINT_FILE.read_text()))
    return set()


def save_checkpoint(done_ids: set):
    CHECKPOINT_FILE.write_text(json.dumps(sorted(done_ids), indent=2))


async def generate_one(sem, client, scenario_desc, index, total, done_ids):
    """Generate one scenario via the API pipeline, with semaphore."""
    sid = scenario_desc["id"]
    async with sem:
        try:
            response = await client.post(
                "http://127.0.0.1:8000/api/scenarios/generate",
                json={
                    "description": scenario_desc["description"],
                    "sector": scenario_desc.get("secteur_id", ""),
                    "type": scenario_desc.get("type_appel_id", "prospection"),
                    "language": scenario_desc.get("language", "fr"),
                },
                timeout=300.0,
            )
            if response.status_code != 200:
                detail = ""
                try:
                    detail = response.json().get("detail", response.text[:200])
                except Exception:
                    detail = response.text[:200]
                print(f"  [{index}/{total}] ❌ {sid} — HTTP {response.status_code}: {detail}")
                return sid, False
            result = response.json()
            if "error" in result:
                print(f"  [{index}/{total}] ❌ {sid} — {result['error']}")
                return sid, False
            gen_id = result.get("scenario_id", result.get("id", "?"))
            print(f"  [{index}/{total}] ✅ {sid} — {gen_id}")
            done_ids.add(sid)
            save_checkpoint(done_ids)
            return sid, True
        except httpx.ReadTimeout:
            print(f"  [{index}/{total}] ❌ {sid} — TIMEOUT (>300s)")
            return sid, False
        except Exception as e:
            print(f"  [{index}/{total}] ❌ {sid} — {type(e).__name__}: {str(e)[:100]}")
            return sid, False


async def main():
    scenarios = json.loads(SCENARIOS_FILE.read_text())
    done_ids = load_checkpoint()

    total = len(scenarios)
    to_generate = [s for s in scenarios if s["id"] not in done_ids]
    skipped = total - len(to_generate)

    print(f"🚀 Génération de scénarios VendMieux (v2 — {CONCURRENCY} en parallèle)")
    print(f"   Total cible : {total}")
    print(f"   Déjà faits (checkpoint) : {skipped}")
    print(f"   Restants : {len(to_generate)}")
    print(f"   Concurrence : {CONCURRENCY}")
    print(f"   ETA estimé : ~{len(to_generate) * 2.5 / CONCURRENCY / 60:.0f}h{int(len(to_generate) * 2.5 / CONCURRENCY) % 60:02d}\n")

    if not to_generate:
        print("✅ Tous les scénarios sont déjà générés !")
        return

    sem = asyncio.Semaphore(CONCURRENCY)
    success = 0
    failed = 0
    failed_ids = []
    start_time = time.time()

    async with httpx.AsyncClient() as client:
        # Launch all tasks with semaphore controlling concurrency
        tasks = [
            generate_one(sem, client, s, i + 1, len(to_generate), done_ids)
            for i, s in enumerate(to_generate)
        ]

        for coro in asyncio.as_completed(tasks):
            sid, ok = await coro
            if ok:
                success += 1
            else:
                failed += 1
                failed_ids.append(sid)

            done = success + failed
            if done % 5 == 0 or done == len(to_generate):
                elapsed = time.time() - start_time
                rate = done / elapsed if elapsed > 0 else 0
                eta = (len(to_generate) - done) / rate if rate > 0 else 0
                pct = done / len(to_generate) * 100
                print(f"\n  --- {done}/{len(to_generate)} ({pct:.0f}%) — ✅ {success} / ❌ {failed} — {rate*60:.1f}/min — ETA: {eta/60:.0f}h{int(eta/60*60)%60:02d} ---\n")

    elapsed_total = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"TERMINÉ en {elapsed_total/60:.1f} minutes")
    print(f"  ✅ Succès : {success}")
    print(f"  ❌ Échecs : {failed}")
    print(f"  ⏭️  Déjà faits : {skipped}")
    print(f"  Total checkpoint : {len(done_ids)}/240")

    if failed_ids:
        print(f"\nScénarios en échec ({len(failed_ids)}) :")
        for fid in failed_ids:
            print(f"  - {fid}")
        with open("/root/vendmieux/bulk_generate_failed.json", "w") as f:
            json.dump(failed_ids, f, indent=2)
        print(f"\nListe sauvegardée dans bulk_generate_failed.json")


if __name__ == "__main__":
    asyncio.run(main())
