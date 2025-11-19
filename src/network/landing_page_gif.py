import networkx as nx
import matplotlib.pyplot as plt
import imageio
import random
import os

# Generate 30 nodes
num_nodes = 30
nodes = list(range(num_nodes))

# Generate random edges (approximately 2-3 edges per node for a connected graph)
num_edges = random.randint(40, 60)
edges_ordered = []
possible_edges = [(i, j) for i in range(num_nodes) for j in range(i + 1, num_nodes)]
random.shuffle(possible_edges)
edges_ordered = possible_edges[:num_edges]

# Create graph with all nodes to get consistent layout
G = nx.Graph()
G.add_nodes_from(nodes)
G.add_edges_from(edges_ordered)

# Freeze layout for consistency - use larger k for more spread out nodes
pos = nx.spring_layout(G, k=1.5, iterations=50, seed=42)

# Normalize positions to cover the entire canvas
x_coords = [pos[node][0] for node in nodes]
y_coords = [pos[node][1] for node in nodes]
x_min, x_max = min(x_coords), max(x_coords)
y_min, y_max = min(y_coords), max(y_coords)
x_range = x_max - x_min if x_max != x_min else 1
y_range = y_max - y_min if y_max != y_min else 1
max_range = max(x_range, y_range) * 0.85  # Use most of the canvas, spreading nodes out

# Normalize all positions to cover entire square
for node in nodes:
    pos[node] = (
        (pos[node][0] - (x_min + x_max) / 2) / max_range,
        (pos[node][1] - (y_min + y_max) / 2) / max_range
    )

# Split edges: 70% static, 30% animating
static_edges_count = int(len(edges_ordered) * 0.7)
static_edges = edges_ordered[:static_edges_count]
animating_edges = edges_ordered[static_edges_count:]

# Animation parameters
frames_per_edge = 7  # Frames to fully draw each edge (3x faster than before)
frames_between_starts = 2  # Frames between starting each new edge animation

frames = []

# Create frames directory if it doesn't exist
media_dir = "src/network/media"
os.makedirs(media_dir, exist_ok=True)

# Calculate total frames needed
total_frames = len(animating_edges) * frames_between_starts + frames_per_edge

for frame_idx in range(total_frames + 1):
    fig, ax = plt.subplots(figsize=(5,5))
    ax.set_xlim(-1.05, 1.05)
    ax.set_ylim(-1.05, 1.05)
    ax.set_aspect('equal')
    ax.axis("off")

    # Create graph with static edges
    Gtemp = nx.Graph()
    Gtemp.add_nodes_from(nodes)
    Gtemp.add_edges_from(static_edges)

    # Draw static edges and nodes
    nx.draw_networkx_nodes(Gtemp, pos, node_color="skyblue", node_size=100, ax=ax)
    nx.draw_networkx_edges(Gtemp, pos, edgelist=static_edges, edge_color="black", width=2, ax=ax)
    
    # Draw animating edges progressively
    for i, edge in enumerate(animating_edges):
        start_frame = i * frames_between_starts
        end_frame = start_frame + frames_per_edge
        
        if frame_idx >= start_frame:
            # Calculate progress (0 to 1)
            progress = min(1.0, (frame_idx - start_frame) / frames_per_edge)
            
            # Get node positions
            x1, y1 = pos[edge[0]]
            x2, y2 = pos[edge[1]]
            
            # Calculate point along the edge based on progress
            x_end = x1 + (x2 - x1) * progress
            y_end = y1 + (y2 - y1) * progress
            
            # Draw the partial edge
            ax.plot([x1, x_end], [y1, y_end], 'k-', linewidth=2, color='black')

    # Save frame
    fname = os.path.join(media_dir, f"frame_{frame_idx}.png")
    fig.savefig(fname, dpi=150, bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    frames.append(imageio.imread(fname))

# Write GIF (overwrites existing file)
gif_path = os.path.join(media_dir, "network_growth.gif")
if os.path.exists(gif_path):
    os.remove(gif_path)
imageio.mimsave(gif_path, frames, duration=0.1, loop=0)

# Clean up individual frame files
for i in range(len(frames)):
    frame_path = os.path.join(media_dir, f"frame_{i}.png")
    if os.path.exists(frame_path):
        os.remove(frame_path)
