"""
VendMieux — Bulk scenario generation script.
Calls POST /api/scenarios/generate for each scenario in scenarios_240.json.
Skips scenarios already in DB. Runs batches of 3 in parallel.
"""
import json
import asyncio
import time
import sys

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

import httpx


async def generate_one(client, scenario_desc, index, total):
    """Generate one scenario via the API pipeline."""
    try:
        response = await client.post(
            "http://127.0.0.1:8000/api/scenarios/generate",
            json={
                "description": scenario_desc["description"],
                "sector": scenario_desc.get("secteur_id", ""),
                "type": scenario_desc.get("type_appel_id", "prospection"),
                "language": scenario_desc.get("language", "fr"),
            },
            timeout=300.0,  # Pipeline takes time (4 LLM calls)
        )
        if response.status_code != 200:
            detail = ""
            try:
                detail = response.json().get("detail", response.text[:150])
            except Exception:
                detail = response.text[:150]
            print(f"  [{index}/{total}] ❌ {scenario_desc['id']} — HTTP {response.status_code}: {detail}")
            return False
        result = response.json()
        if "error" in result:
            print(f"  [{index}/{total}] ❌ {scenario_desc['id']} — {result['error']}")
            return False
        else:
            sid = result.get("scenario_id", result.get("id", "?"))
            print(f"  [{index}/{total}] ✅ {scenario_desc['id']} — {sid}")
            return True
    except httpx.ReadTimeout:
        print(f"  [{index}/{total}] ❌ {scenario_desc['id']} — TIMEOUT (>300s)")
        return False
    except Exception as e:
        print(f"  [{index}/{total}] ❌ {scenario_desc['id']} — {type(e).__name__}: {str(e)[:80]}")
        return False


async def main():
    with open("/root/vendmieux/scenarios_240.json", "r") as f:
        scenarios = json.load(f)

    total = len(scenarios)
    print(f"🚀 Génération de {total} scénarios...")
    print(f"   Coût estimé : ~${total * 0.10:.0f}")
    print(f"   Temps estimé : ~{total * 2 / 60:.0f} minutes\n")

    # Check which scenarios already exist
    try:
        r = httpx.get("http://127.0.0.1:8000/api/scenarios", timeout=10)
        existing = r.json()
        if isinstance(existing, dict) and "scenarios" in existing:
            existing = existing["scenarios"]
        existing_ids = {s.get("id", "") for s in existing} if isinstance(existing, list) else set()
    except Exception:
        existing_ids = set()

    to_generate = [s for s in scenarios if s["id"] not in existing_ids]
    skipped = total - len(to_generate)
    if skipped > 0:
        print(f"⏭️  {skipped} scénarios déjà en BDD, ignorés")

    print(f"📝 {len(to_generate)} scénarios à générer\n")

    if not to_generate:
        print("✅ Tous les scénarios sont déjà en BDD !")
        return

    success = 0
    failed = 0
    failed_ids = []
    start_time = time.time()

    # Sequential processing (generate_scenario is sync, concurrent requests block FastAPI)
    BATCH_SIZE = 1

    async with httpx.AsyncClient() as client:
        for i in range(0, len(to_generate), BATCH_SIZE):
            batch = to_generate[i:i + BATCH_SIZE]
            tasks = [
                generate_one(client, s, i + j + 1, len(to_generate))
                for j, s in enumerate(batch)
            ]
            results = await asyncio.gather(*tasks)

            for j, r in enumerate(results):
                if r:
                    success += 1
                else:
                    failed += 1
                    failed_ids.append(to_generate[i + j]["id"])

            # Pause between batches
            if i + BATCH_SIZE < len(to_generate):
                await asyncio.sleep(2)

            # Progress
            done = i + len(batch)
            pct = done / len(to_generate) * 100
            elapsed = time.time() - start_time
            rate = done / elapsed if elapsed > 0 else 0
            eta = (len(to_generate) - done) / rate if rate > 0 else 0
            print(f"\n  --- Progression : {done}/{len(to_generate)} ({pct:.0f}%) — ✅ {success} / ❌ {failed} — ETA: {eta/60:.0f}min ---\n")

    elapsed_total = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"TERMINÉ en {elapsed_total/60:.1f} minutes")
    print(f"  ✅ Succès : {success}")
    print(f"  ❌ Échecs : {failed}")
    print(f"  ⏭️  Déjà en BDD : {skipped}")
    print(f"  Total en BDD : ~{success + skipped + len(existing_ids)}")

    if failed_ids:
        print(f"\nScénarios en échec :")
        for fid in failed_ids:
            print(f"  - {fid}")
        # Save failed IDs for retry
        with open("/root/vendmieux/bulk_generate_failed.json", "w") as f:
            json.dump(failed_ids, f, indent=2)
        print(f"\nListe sauvegardée dans bulk_generate_failed.json")


if __name__ == "__main__":
    asyncio.run(main())
