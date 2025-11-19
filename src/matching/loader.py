"""Utility helpers for prototyping the matching algorithm in Python."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict
from student import Student

DATA_FILE = Path(__file__).parent / "data" / "local_dataset.json"
MOCK_DATASET_FILE = Path(__file__).parent / "data" / "mock_dataset.json"

def load_local_dataset(path: Path = DATA_FILE) -> Dict[str, Any]:
    """Load the locally cached dataset produced by dataAccess.ts."""
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)

def save_local_dataset(dataset: Dict[str, Any], path: Path = DATA_FILE) -> None:
    """Save a dataset to the local JSON file."""
    with path.open("w", encoding="utf-8") as fh:
        json.dump(dataset, fh, indent=2, ensure_ascii=False)

def save_mock_dataset(dataset: Dict[str, Any], path: Path = MOCK_DATASET_FILE) -> None:
    """
    Save a mock dataset to a JSON file.
    
    Args:
        dataset: Dictionary with 'students' and 'matches' keys
        path: Path to save the mock dataset (defaults to data/mock_dataset.json)
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(dataset, fh, indent=2, ensure_ascii=False)

def load_mock_dataset(path: Path = MOCK_DATASET_FILE) -> Dict[str, Any]:
    """
    Load a mock dataset from a JSON file.
    
    Args:
        path: Path to the mock dataset file (defaults to data/mock_dataset.json)
    
    Returns:
        Dictionary with 'students' and 'matches' keys
    
    Raises:
        FileNotFoundError: If the file doesn't exist
    """
    if not path.exists():
        raise FileNotFoundError(f"Mock dataset file not found: {path}")
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

    