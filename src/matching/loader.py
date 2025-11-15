"""Utility helpers for prototyping the matching algorithm in Python."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict
import numpy as np
from matching.student import Student

DATA_FILE = Path(__file__).parent / "data" / "local_dataset.json"

def load_local_dataset(path: Path = DATA_FILE) -> Dict[str, Any]:
    """Load the locally cached dataset produced by dataAccess.ts."""
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)

def parse_student(student: Dict[str, Any]) -> Student:
    return Student(
        id=student["id"],
        first_name=student["first_name"] or None,
        last_name=student["last_name"] or None,
        email=student["email"],
        grad_year=student["grad_year"] or None,
        major=student["major"] or None,
        interests=student["interests"] or None,
        sex=student["sex"] or None,
        dorm=student["dorm"] or None,
        involvements=student["involvements"] or None,
        close_friends=student["close_friends"] or None,
        survey_completed=student["survey_completed"],
    )
    
def match_score(student_a: Student, student_b: Student) -> float:
    return 0.0

def sinkhorn_matching(scores: np.ndarray) -> np.ndarray:
    return scores

if __name__ == "__main__":
    dataset = load_local_dataset()
    parsed_students = []
    for student in dataset["students"]:
        parsed_student = parse_student(student)
        parsed_students.append(parsed_student)
    print(f"Loaded {len(parsed_students)} students")
    
    scores = np.zeros((len(parsed_students), len(parsed_students)))
    
    for student_a in parsed_students:
        for student_b in parsed_students:
            if student_a.id != student_b.id:
                score = match_score(student_a, student_b)
                scores[parsed_students.index(student_a), parsed_students.index(student_b)] = score

    