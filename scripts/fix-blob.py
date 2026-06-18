#!/usr/bin/env python3
import json, subprocess, time

# Load token from file
with open("/tmp/blob_token.txt") as f:
    TOK = f.read().strip()

AUTH = "Bearer " + TOK
BASE = "https://blob.vercel-storage.com"

# Delete old
r = subprocess.run(["curl", "-s", "-H", "Authorization: " + AUTH, BASE + "/?prefix=data/lessons.json"],
                   capture_output=True, text=True, timeout=15)
for b in json.loads(r.stdout).get("blobs", []):
    subprocess.run(["curl", "-s", "-X", "DELETE", "-H", "Authorization: " + AUTH, b["url"]],
                   capture_output=True, timeout=15)
    print("Deleted: " + b["pathname"])

# Build data
topics = {}
data = [
    ("2026-05-11", [
        ("2026-05-11-g7-agriculture", "Weeding Methods + Thinning & Gapping"),
        ("2026-05-12-g9-pre-tech", "Visual Programming Pt 1"),
        ("2026-05-12-g7-agriculture", "Earthing Up + Hardening (Curing)"),
        ("2026-05-13-g7-agriculture", "Importance of Crop Management Practices"),
        ("2026-05-14-g7-pre-tech", "Types of Lines in Drawing Pt 1"),
        ("2026-05-15-g9-pre-tech", "Visual Programming Pt 2"),
        ("2026-05-15-g7-pre-tech", "Types of Lines in Drawing Pt 2"),
    ]),
    ("2026-05-18", [
        ("2026-05-18-g7-agriculture", "Preparing Animal Products: Eggs and Honey Pt1"),
        ("2026-05-19-g9-pre-tech", "Materials for Production: Wood"),
        ("2026-05-19-g7-agriculture", "Preparing Animal Products: Eggs and Honey Pt2"),
        ("2026-05-20-g7-agriculture", "Hygiene in Rearing Animals"),
        ("2026-05-21-g7-pre-tech", "Economic Resources Pt1"),
        ("2026-05-22-g9-pre-tech", "Wood in Production and Waste Materials"),
        ("2026-05-22-g7-pre-tech", "Economic Resources Classification Pt2"),
    ]),
    ("2026-05-25", [
        ("2026-05-25-g7-agriculture", "Sorting and Grading of Eggs"),
        ("2026-05-26-g9-pre-tech", "Wood as a Production Material"),
        ("2026-05-26-g7-agriculture", "Processing of Honey"),
        ("2026-05-27-g7-agriculture", "Hygiene in Rearing Animals Best Practices"),
        ("2026-05-28-g7-pre-tech", "Metallic vs Non-metallic Materials"),
        ("2026-05-29-g9-pre-tech", "Wood in Kenyan Production"),
        ("2026-05-29-g7-pre-tech", "Production of Goods and Services"),
    ]),
    ("2026-06-01", [
        ("2026-06-01-g7-agriculture", "Introduction to Crochet"),
        ("2026-06-02-g9-pre-tech", "Environmental Conservation"),
        ("2026-06-02-g7-agriculture", "Crochet Patterns and Techniques"),
        ("2026-06-03-g7-agriculture", "Practical Crochet Projects"),
        ("2026-06-04-g7-pre-tech", "Introduction to Entrepreneurship"),
        ("2026-06-05-g9-pre-tech", "Environmental Conservation Methods"),
        ("2026-06-05-g7-pre-tech", "Entrepreneurs and Business Enterprises"),
    ]),
]
for w, items in data:
    for lid, topic in items:
        topics[lid] = {"topic": topic}

print("Writing " + str(len(topics)) + " topics")

ct = json.dumps(topics, indent=2)
wr = subprocess.run(
    ["curl", "-s", "-X", "PUT", "-H", "Authorization: " + AUTH,
     "-H", "Content-Type: application/json", "-H", "x-vercel-blob-access: public",
     BASE + "/data/lessons.json", "--data-binary", ct],
    capture_output=True, text=True, timeout=30)
print("Write: " + wr.stdout[:150])

time.sleep(3)
vr = subprocess.run(["curl", "-s",
    "https://lwl0vea488ilvyqs.public.blob.vercel-storage.com/data/lessons.json"],
    capture_output=True, text=True, timeout=15)
db = json.loads(vr.stdout)
wks = sorted(set(k[:10] for k in db))
print("Done: " + str(len(db)) + " topics, " + str(len(wks)) + " weeks")
for w in wks:
    n = sum(1 for k in db if k.startswith(w))
    print("  " + w + ": " + str(n) + "/7")
