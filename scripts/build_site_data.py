#!/usr/bin/env python3
"""Convert the verified election annexure into static JSON for the dashboard."""
from __future__ import annotations
import argparse, json
from pathlib import Path
import pandas as pd

def clean(value):
    if pd.isna(value): return None
    if hasattr(value, "item"): value = value.item()
    if isinstance(value, float) and value.is_integer(): return int(value)
    return value

def rows(frame):
    return [{str(k): clean(v) for k, v in row.items()} for row in frame.to_dict(orient="records")]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    outlook = pd.read_excel(args.workbook, sheet_name="Constituency Outlook")
    candidates = pd.read_excel(args.workbook, sheet_name="All Candidates 2022")
    parties = pd.read_excel(args.workbook, sheet_name="Party Summary")
    segments = pd.read_excel(args.workbook, sheet_name="2024 Segment Leads")
    validation = pd.read_excel(args.workbook, sheet_name="Validation")
    seat_rows, candidate_rows, party_rows, segment_rows = map(rows, [outlook, candidates, parties, segments])
    by_ac = {}
    for candidate in candidate_rows: by_ac.setdefault(int(candidate["AC"]), []).append(candidate)
    segment_by_ac = {int(row["AC"]): row for row in segment_rows}
    for seat in seat_rows:
        ac = int(seat["AC"])
        seat["candidates"] = by_ac.get(ac, [])
        seat["segmentInterpretation"] = segment_by_ac.get(ac, {}).get("Interpretation")
    rating_order = ["Government bloc strong", "Government bloc advantage", "MGP strong", "Toss-up", "Opposition advantage", "Opposition strong"]
    counts = outlook["2027 evidence rating"].value_counts().to_dict()
    checks = {str(row["Check"]): clean(row["Result"]) for row in validation.to_dict(orient="records")}
    payload = {
        "meta": {"title":"Goa Election Intelligence","subtitle":"2022 results · 2024 signals · 2027 evidence outlook","asOf":"2 August 2026","candidateCount":checks.get("Candidate rows",301),"constituencyCount":checks.get("Constituencies",40),"closeSeatCount":checks.get("Close seats <=1000",10),"bjp2024Leads":checks.get("BJP 2024 segment leads",27),"inc2024Leads":checks.get("INC 2024 segment leads",13)},
        "ratingSummary":[{"rating":r,"count":int(counts.get(r,0))} for r in rating_order],
        "parties":party_rows,"constituencies":seat_rows,"candidates":candidate_rows,"segments2024":segment_rows,
    }
    args.output.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")

if __name__ == "__main__": main()
