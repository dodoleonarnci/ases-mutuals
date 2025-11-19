"""Sinkhorn matching algorithm and related utilities."""

from __future__ import annotations

import json
import random
from datetime import datetime, timezone
from typing import Any, Dict
import numpy as np
from student import Student


def match_score(student_a: Student, student_b: Student) -> float:
    """Calculate match score between two students (lower is better)."""
    return 0.0


def generate_mock_dataset(
    num_students: int = 100,
    seed: int | None = None,
) -> Dict[str, Any]:
    """
    Generate a mock dataset of college students with basic information.
    
    Args:
        num_students: Number of students to generate
        seed: Random seed for reproducibility
    
    Returns:
        Dictionary with 'students' and 'matches' keys matching the dataset format
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)
    
    # Sample data pools for realistic generation
    first_names = [
        "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
        "Sam", "Cameron", "Dakota", "Skylar", "Blake", "Sage", "River", "Phoenix",
        "Emma", "Olivia", "Noah", "Liam", "Sophia", "Ava", "Mia", "Isabella",
        "James", "William", "Benjamin", "Lucas", "Henry", "Alexander", "Mason",
        "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth"
    ]
    
    last_names = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
        "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
        "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen",
        "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green"
    ]
    
    majors = [
        "Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry",
        "Biology", "Economics", "Political Science", "Psychology", "English",
        "History", "Philosophy", "Art", "Music", "Business", "Medicine"
    ]
    
    interests_pool = [
        "Music", "Sports", "Reading", "Gaming", "Cooking", "Travel", "Photography",
        "Art", "Dancing", "Hiking", "Yoga", "Movies", "Theater", "Volunteering",
        "Entrepreneurship", "Research", "Writing", "Fitness", "Meditation", "Chess"
    ]
    
    dorms = [
        "Lagunita Court", "GovCo", "Florence Moore", "Stern", "Crothers", "Branner",
        "Wilbur", "Casper"
    ]
    
    involvements_pool = [
        "Entrepreneurship", "Dance Groups", "Theater", "Club Sports", "Research Lab", 
        "Newspaper", "Robotics", "ACM", "Instrumental music", "Vocal", "Sustainability"
    ]
    
    sex_options = ["male", "female", "non-binary"]
    
    # Generate student basic info
    students = []
    
    for i in range(num_students):
        # Generate unique ID (similar to email handle)
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        handle = f"{first_name.lower()}{last_name.lower()}{i}"
        student_id = handle
        
        email = f"{handle}@stanford.edu"
        grad_year = random.randint(2024, 2030)
        major = random.choice(majors)
        sex = random.choice(sex_options)
        dorm = random.choice(dorms)
        involvements = random.choice(involvements_pool)
        
        # Generate 1-5 interests
        num_interests = random.randint(1, 5)
        interests = random.sample(interests_pool, num_interests)
        
        # Randomly decide if first/last name should be null (some students might not provide)
        first_name_val = first_name if random.random() > 0.1 else None
        last_name_val = last_name if random.random() > 0.1 else None
        
        student = {
            "id": student_id,
            "first_name": first_name_val,
            "last_name": last_name_val,
            "email": email,
            "grad_year": grad_year,
            "major": major,
            "interests": interests,
            "sex": sex,
            "dorm": dorm,
            "involvements": involvements,
            "close_friends": [],  # Empty - scoring handled by match_score function
            "survey_completed": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        students.append(student)
    
    return {
        "students": students,
        "matches": []
    }


def sinkhorn_matching(
    scores: np.ndarray,
    students: list[Student],
    lambda_reg: float = 1.0,
    max_iterations: int = 1000,
    tolerance: float = 1e-6,
) -> np.ndarray:
    """
    Apply Sinkhorn algorithm to find optimal matching pairs.
    
    Args:
        scores: Distance matrix where scores[i, j] is match_score between students[i] and students[j]
        students: List of students in the same order as the scores matrix
        lambda_reg: Regularization parameter (higher = more entropy, softer matching)
        max_iterations: Maximum number of Sinkhorn iterations
        tolerance: Convergence tolerance
    
    Returns:
        Doubly stochastic matrix representing the matching probabilities
    """
    n = len(students)
    
    # Create cost matrix from scores (match_score is distance, so lower is better)
    cost_matrix = scores.copy()
    
    # Set very high cost for pairs that are already close friends
    # Also set high cost for self-pairs
    for i in range(n):
        for j in range(n):
            if i == j:
                cost_matrix[i, j] = np.inf
            elif students[i].close_friends and students[j].id in students[i].close_friends:
                # If student i has student j as close friend, don't match them
                cost_matrix[i, j] = np.inf
            elif students[j].close_friends and students[i].id in students[j].close_friends:
                # If student j has student i as close friend, don't match them
                cost_matrix[i, j] = np.inf
    
    # Initialize kernel matrix: K = exp(-lambda * cost)
    # Use a large value for inf costs to effectively zero them out
    kernel = np.exp(-lambda_reg * cost_matrix)
    kernel[np.isinf(cost_matrix)] = 0.0
    kernel[np.isnan(kernel)] = 0.0
    
    # Initialize scaling vectors (start with ones)
    u = np.ones(n)
    v = np.ones(n)
    
    # Sinkhorn iterations: normalize rows and columns alternately
    for iteration in range(max_iterations):
        # Update u: normalize rows to sum to 1
        u_prev = u.copy()
        v_prev = v.copy()
        
        # u = 1 / (K @ v) ensures each row of diag(u) @ K @ diag(v) sums to 1
        u = 1.0 / (kernel @ v + 1e-16)
        
        # v = 1 / (K.T @ u) ensures each column of diag(u) @ K @ diag(v) sums to 1
        v = 1.0 / (kernel.T @ u + 1e-16)
        
        # Check convergence
        u_change = np.max(np.abs(u - u_prev))
        v_change = np.max(np.abs(v - v_prev))
        if u_change < tolerance and v_change < tolerance:
            break
    
    # Compute final doubly stochastic matrix: P = diag(u) @ K @ diag(v)
    # This ensures each row and column sums to 1
    matching_matrix = np.diag(u) @ kernel @ np.diag(v)
    
    return matching_matrix

