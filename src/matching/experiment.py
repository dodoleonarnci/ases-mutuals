"""Mock experiment for testing Sinkhorn matching algorithm."""

import json
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import loader
import sinkhorn


def extract_matches(matching_matrix: np.ndarray, students: list) -> list[dict]:
    """
    Extract discrete matches from the matching matrix.
    Uses greedy approach: for each student, find their highest probability match.
    """
    n = len(students)
    matches = []
    used = set()
    
    # Sort all potential pairs by matching probability
    pairs = []
    for i in range(n):
        for j in range(n):
            if i != j and matching_matrix[i, j] > 0:
                pairs.append((i, j, matching_matrix[i, j]))
    
    # Sort by probability (descending)
    pairs.sort(key=lambda x: x[2], reverse=True)
    
    # Greedily assign matches
    for i, j, prob in pairs:
        if i not in used and j not in used and i != j:
            matches.append({
                "student_a_id": students[i].id,
                "student_b_id": students[j].id,
                "compatibility_score": float(prob),
                "student_a_name": students[i].first_name or students[i].id,
                "student_b_name": students[j].first_name or students[j].id,
            })
            used.add(i)
            used.add(j)
    
    return matches


def visualize_results(
    students: list,
    scores: np.ndarray,
    matching_matrix: np.ndarray,
    matches: list[dict],
    output_dir: Path,
) -> None:
    """Create visualizations of the matching experiment."""
    n = len(students)
    
    # Create figure with subplots
    fig = plt.figure(figsize=(16, 12))
    
    # 1. Score matrix heatmap
    ax1 = plt.subplot(2, 3, 1)
    im1 = ax1.imshow(scores, cmap='viridis', aspect='auto')
    ax1.set_title('Match Score Matrix (Distance)')
    ax1.set_xlabel('Student Index')
    ax1.set_ylabel('Student Index')
    plt.colorbar(im1, ax=ax1)
    
    # 2. Matching matrix heatmap
    ax2 = plt.subplot(2, 3, 2)
    im2 = ax2.imshow(matching_matrix, cmap='hot', aspect='auto')
    ax2.set_title('Sinkhorn Matching Matrix (Probabilities)')
    ax2.set_xlabel('Student Index')
    ax2.set_ylabel('Student Index')
    plt.colorbar(im2, ax=ax2)
    
    # 3. Distribution of match scores
    ax3 = plt.subplot(2, 3, 3)
    # Filter out infinities and diagonal (self-pairs), but keep zeros as valid scores
    mask = ~np.isinf(scores)
    np.fill_diagonal(mask, False)  # Exclude diagonal (self-pairs)
    valid_scores = scores[mask]
    if len(valid_scores) > 0:
        ax3.hist(valid_scores, bins=30, edgecolor='black', alpha=0.7)
        ax3.set_title('Distribution of Match Scores')
        ax3.set_xlabel('Match Score')
        ax3.set_ylabel('Frequency')
    
    # 4. Distribution of matching probabilities
    ax4 = plt.subplot(2, 3, 4)
    valid_probs = matching_matrix[matching_matrix > 0]
    if len(valid_probs) > 0:
        ax4.hist(valid_probs, bins=30, edgecolor='black', alpha=0.7, color='orange')
        ax4.set_title('Distribution of Matching Probabilities')
        ax4.set_xlabel('Matching Probability')
        ax4.set_ylabel('Frequency')
    
    # 5. Number of close friends per student
    ax5 = plt.subplot(2, 3, 5)
    friend_counts = [
        len(s.close_friends) if s.close_friends else 0
        for s in students
    ]
    ax5.hist(friend_counts, bins=20, edgecolor='black', alpha=0.7, color='green')
    ax5.set_title('Distribution of Close Friends per Student')
    ax5.set_xlabel('Number of Close Friends')
    ax5.set_ylabel('Number of Students')
    ax5.axvline(np.mean(friend_counts), color='red', linestyle='--', 
                label=f'Mean: {np.mean(friend_counts):.1f}')
    ax5.legend()
    
    # 6. Matching probability vs match score scatter
    ax6 = plt.subplot(2, 3, 6)
    probs = []
    scrs = []
    for i in range(n):
        for j in range(n):
            if i != j and scores[i, j] != np.inf and matching_matrix[i, j] > 0:
                probs.append(matching_matrix[i, j])
                scrs.append(scores[i, j])
    if len(probs) > 0:
        ax6.scatter(scrs, probs, alpha=0.5, s=10)
        ax6.set_title('Matching Probability vs Match Score')
        ax6.set_xlabel('Match Score (Distance)')
        ax6.set_ylabel('Matching Probability')
        ax6.set_yscale('log')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'matching_analysis.png', dpi=150, bbox_inches='tight')
    print(f"Saved visualization to {output_dir / 'matching_analysis.png'}")
    plt.close()


if __name__ == "__main__":
    # Configuration
    num_students = 100
    seed = 42
    output_dir = Path(__file__).parent / "data"
    matches_output_file = output_dir / "matches.json"
    mock_dataset_file = output_dir / "mock_dataset.json"
    
    # Set to True to load from file, False to generate new
    load_from_file = False
    
    print("=" * 60)
    print("Sinkhorn Matching Experiment")
    print("=" * 60)
    
    # Step 1: Generate or load mock dataset
    if load_from_file:
        print(f"\n1. Loading mock dataset from {mock_dataset_file}...")
        try:
            dataset = loader.load_mock_dataset(mock_dataset_file)
            print(f"   Loaded {len(dataset['students'])} students from file")
        except FileNotFoundError:
            print(f"   File not found, generating new dataset...")
            dataset = sinkhorn.generate_mock_dataset(
                num_students=num_students,
                seed=seed,
            )
            print(f"   Generated {len(dataset['students'])} students")
            loader.save_mock_dataset(dataset, mock_dataset_file)
            print(f"   Saved dataset to {mock_dataset_file}")
    else:
        print(f"\n1. Generating mock dataset with {num_students} students...")
        dataset = sinkhorn.generate_mock_dataset(
            num_students=num_students,
            seed=seed,
        )
        print(f"   Generated {len(dataset['students'])} students")
        loader.save_mock_dataset(dataset, mock_dataset_file)
        print(f"   Saved dataset to {mock_dataset_file}")
    
    # Step 2: Parse students
    print("\n2. Parsing students...")
    parsed_students = []
    for student in dataset["students"]:
        parsed_student = loader.parse_student(student)
        parsed_students.append(parsed_student)
    print(f"   Parsed {len(parsed_students)} students")
    
    # Step 3: Calculate match scores
    print("\n3. Calculating match scores...")
    scores = np.zeros((len(parsed_students), len(parsed_students)))
    for i, student_a in enumerate(parsed_students):
        for j, student_b in enumerate(parsed_students):
            if student_a.id != student_b.id:
                score = sinkhorn.match_score(student_a, student_b)
                scores[i, j] = score
    
    # Calculate statistics
    # Filter out infinities and diagonal (self-pairs), but keep zeros as valid scores
    mask = ~np.isinf(scores)
    np.fill_diagonal(mask, False)  # Exclude diagonal (self-pairs)
    valid_scores = scores[mask]
    print(f"   Computed {len(valid_scores)} match scores")
    if len(valid_scores) > 0:
        print(f"   Score range: [{np.min(valid_scores):.2f}, {np.max(valid_scores):.2f}]")
        print(f"   Mean score: {np.mean(valid_scores):.2f}")
    else:
        print("   Warning: No valid scores computed (all scores are zero or invalid)")
    
    # Step 4: Apply Sinkhorn matching
    print("\n4. Applying Sinkhorn matching algorithm...")
    matching_matrix = sinkhorn.sinkhorn_matching(
        scores,
        parsed_students,
        lambda_reg=1.0,
        max_iterations=1000,
        tolerance=1e-6,
    )
    print(f"   Matching matrix shape: {matching_matrix.shape}")
    print(f"   Matrix sum: {matching_matrix.sum():.2f} (expected ~{len(parsed_students)})")
    print(f"   Non-zero entries: {np.count_nonzero(matching_matrix)}")
    
    # Step 5: Extract discrete matches
    print("\n5. Extracting discrete matches...")
    matches = extract_matches(matching_matrix, parsed_students)
    print(f"   Found {len(matches)} matched pairs")
    print(f"   Coverage: {len(matches) * 2}/{len(parsed_students)} students matched")
    
    # Display top matches
    if matches:
        print("\n   Top 10 matches by probability:")
        sorted_matches = sorted(matches, key=lambda x: x["compatibility_score"], reverse=True)
        for i, match in enumerate(sorted_matches[:10], 1):
            print(f"   {i}. {match['student_a_name']} <-> {match['student_b_name']} "
                  f"(score: {match['compatibility_score']:.4f})")
    
    # Step 6: Create visualizations
    print("\n6. Creating visualizations...")
    visualize_results(parsed_students, scores, matching_matrix, matches, output_dir)
    
    # Step 7: Save matches to JSON
    print(f"\n7. Saving matches to {matches_output_file}...")
    output_data = {
        "experiment_config": {
            "num_students": num_students,
            "seed": seed,
            "lambda_reg": 1.0,
        },
        "statistics": {
            "total_students": len(parsed_students),
            "total_matches": len(matches),
            "coverage_percentage": (len(matches) * 2 / len(parsed_students)) * 100,
            "mean_match_score": float(np.mean(valid_scores)) if len(valid_scores) > 0 else 0.0,
            "mean_matching_probability": float(np.mean(matching_matrix[matching_matrix > 0])) if np.count_nonzero(matching_matrix) > 0 else 0.0,
        },
        "matches": matches,
    }
    
    with matches_output_file.open("w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    print(f"   Saved {len(matches)} matches to JSON")
    
    print("\n" + "=" * 60)
    print("Experiment completed successfully!")
    print("=" * 60)
