import os
import re
import json
import uuid
from math import cos, sin, sqrt, atan2, pi
from pathlib import Path
from typing import Dict, Set, List, Tuple, Any

def should_process_directory(dirpath: str, project_path: str) -> bool:
    """Check if the directory should be processed."""
    path_parts = os.path.relpath(dirpath, project_path).split(os.sep)
    if 'src' not in path_parts:
        return False
    if any(part.startswith('.') for part in path_parts):
        return False
    return True

def should_process_file(filename: str) -> bool:
    """Check if the file should be processed."""
    if filename.startswith('.') or filename.endswith('.d.ts'):
        return False
    return filename.endswith(('.ts', '.tsx', '.js', '.jsx'))

def should_include_index_file(file_path: str) -> bool:
    """Check if an index file should be included based on its dependencies."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if file only contains imports and exports
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        is_pure_reexport = all(
            line.startswith('import') or 
            line.startswith('export') or 
            line.startswith('//') or 
            line.startswith('/*') or 
            line.startswith('*') or 
            line.endswith('*/') or
            not line
            for line in lines
        )
        return not is_pure_reexport
    except:
        return True

def get_normalized_filename(filepath: str, project_path: str) -> str:
    """Get normalized filename without path and extension."""
    try:
        src_index = filepath.index('src')
        relative_path = filepath[src_index:]
    except ValueError:
        relative_path = os.path.relpath(filepath, project_path)
    
    filename = os.path.splitext(os.path.basename(relative_path))[0]
    return filename

def get_file_type(filename: str) -> str:
    """Determine the type of the file for coloring purposes."""
    filename = filename.lower()
    
    if filename in ['app', 'app.tsx', 'app.ts', 'app.jsx', 'app.js']:
        return 'app'
    elif 'page' in filename:
        return 'page'
    elif 'context' in filename:
        return 'context'
    elif 'service' in filename or 'api' in filename:
        return 'service'
    elif 'type' in filename or 'interface' in filename:
        return 'type'
    else:
        return 'default'

def get_node_color(file_type: str) -> str:
    """Get the background color for a node based on its type."""
    colors = {
        'app': '#4CAF50',      # Green
        'page': '#2196F3',     # Blue
        'context': '#FF9800',  # Orange
        'service': '#9C27B0',  # Purple
        'type': '#FF5722',     # Deep Orange
        'default': '#FFFFFF'   # White
    }
    return colors.get(file_type, colors['default'])

def calculate_node_positions(nodes: Set[str], entry_point: str = "App") -> Dict[str, Tuple[float, float]]:
    """Calculate non-overlapping positions for nodes with entry point at top."""
    positions = {}
    node_list = list(nodes)
    
    # Put entry point at the top
    if entry_point in node_list:
        node_list.remove(entry_point)
        node_list.insert(0, entry_point)
    
    # Constants for layout
    CENTER_X = 2000
    CENTER_Y = 2000
    NODE_WIDTH = 180
    NODE_HEIGHT = 80
    MIN_DISTANCE = sqrt(NODE_WIDTH**2 + NODE_HEIGHT**2) * 1.2
    
    def get_initial_position(index: int, total: int) -> Tuple[float, float]:
        if index == 0:  # Entry point at top
            return (CENTER_X, CENTER_Y - 400)
        
        # Others in a larger circle below
        radius = 400 if total <= 10 else 600
        angle = (2 * pi * (index - 1)) / (total - 1) - pi/2  # Start from bottom
        x = CENTER_X + radius * cos(angle)
        y = CENTER_Y + radius * sin(angle)
        return (x, y)
    
    def check_overlap(pos1: Tuple[float, float], pos2: Tuple[float, float]) -> bool:
        dx = abs(pos1[0] - pos2[0])
        dy = abs(pos1[1] - pos2[1])
        return dx < NODE_WIDTH * 1.2 and dy < NODE_HEIGHT * 1.2
    
    def adjust_position(base_pos: Tuple[float, float], existing_positions: List[Tuple[float, float]]) -> Tuple[float, float]:
        x, y = base_pos
        attempts = 0
        while attempts < 100:
            overlap = False
            for pos in existing_positions:
                if check_overlap((x, y), pos):
                    overlap = True
                    break
            
            if not overlap:
                return (x, y)
            
            # Spiral out to find non-overlapping position
            angle = 2 * pi * attempts / 20
            radius = (attempts // 20 + 1) * MIN_DISTANCE
            x = base_pos[0] + radius * cos(angle)
            y = base_pos[1] + radius * sin(angle)
            attempts += 1
        
        return (x, y)
    
    # Place nodes
    for i, node in enumerate(node_list):
        base_pos = get_initial_position(i, len(node_list))
        final_pos = adjust_position(base_pos, list(positions.values()))
        positions[node] = final_pos
    
    return positions

def create_node_element(node: str, pos: Tuple[float, float], index: int, file_type: str) -> Tuple[Dict[str, Any], Dict[str, Any], str]:
    """Creates a node element with proper binding and coloring."""
    x, y = pos
    width = 180
    height = 80
    
    rect_id = str(uuid.uuid4())
    text_id = str(uuid.uuid4())
    group_id = str(uuid.uuid4())
    
    bg_color = get_node_color(file_type)
    is_special = file_type != 'default'
    
    rectangle = {
        "id": rect_id,
        "type": "rectangle",
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": bg_color,
        "fillStyle": "solid",
        "strokeWidth": is_special and 2 or 1,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [group_id],
        "frameId": None,
        "roundness": {"type": 3},
        "seed": index,
        "version": 1,
        "versionNonce": 1,
        "isDeleted": False,
        "boundElements": [
            {"id": text_id, "type": "text"}
        ],
        "updated": 1,
        "link": None,
        "locked": False
    }
    
    text_color = "#FFFFFF" if file_type != 'default' else "#1e1e1e"
    
    text = {
        "id": text_id,
        "type": "text",
        "x": x + width/2,
        "y": y + height/2,
        "width": width,
        "height": height,
        "angle": 0,
        "strokeColor": text_color,
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [group_id],
        "frameId": None,
        "roundness": None,
        "seed": index + 1000,
        "version": 1,
        "versionNonce": 1,
        "isDeleted": False,
        "boundElements": [],
        "updated": 1,
        "link": None,
        "locked": False,
        "fontSize": 20,
        "fontFamily": 1,
        "text": node,
        "textAlign": "center",
        "verticalAlign": "middle",
        "containerId": rect_id,
        "originalText": node,
        "lineHeight": 1.25,
        "baseline": 18
    }
    
    return (rectangle, text, rect_id)

def create_arrow_element(source: Dict[str, Any], target: Dict[str, Any], arrow_id: str) -> Dict[str, Any]:
    """Creates an arrow element with proper binding."""
    source_center = (source["x"] + source["width"]/2, source["y"] + source["height"]/2)
    target_center = (target["x"] + target["width"]/2, target["y"] + target["height"]/2)
    
    return {
        "id": arrow_id,
        "type": "arrow",
        "x": source_center[0],
        "y": source_center[1],
        "width": target_center[0] - source_center[0],
        "height": target_center[1] - source_center[1],
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "roundness": {"type": 2},
        "seed": int(uuid.uuid4().int % 1000000),
        "version": 1,
        "versionNonce": 1,
        "isDeleted": False,
        "boundElements": None,
        "updated": 1,
        "link": None,
        "locked": False,
        "points": [[0, 0], 
                  [target_center[0] - source_center[0], 
                   target_center[1] - source_center[1]]],
        "lastCommittedPoint": None,
        "startBinding": {
            "elementId": source["id"],
            "focus": 0.5,
            "gap": 4
        },
        "endBinding": {
            "elementId": target["id"],
            "focus": 0.5,
            "gap": 4
        },
        "startArrowhead": None,
        "endArrowhead": "arrow"
    }

def analyze_dependencies(project_path: str) -> Dict[str, Set[str]]:
    """Analyzes TypeScript/React project dependencies."""
    dependencies = {}
    src_path = os.path.join(project_path, 'src')
    
    if not os.path.exists(src_path):
        print("Error: No 'src' directory found in the project path.")
        return dependencies
    
    def process_file(file_path: str) -> None:
        file_node = get_normalized_filename(file_path, project_path)
        
        # Skip index files that only re-export
        if file_node.lower() == 'index' and not should_include_index_file(file_path):
            return
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            print(f"Warning: Skipping file due to encoding issues: {file_path}")
            return
            
        if file_node not in dependencies:
            dependencies[file_node] = set()
            
        import_patterns = [
            r'import.*from\s[\'"](.+?)[\'"]',
            r'require\([\'"](.+?)[\'"]\)'
        ]
        
        for pattern in import_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                import_path = match.group(1)
                
                if import_path.startswith('.'):
                    import_path = os.path.normpath(os.path.join(
                        os.path.dirname(file_path),
                        import_path
                    ))
                    import_name = get_normalized_filename(import_path, project_path)
                    
                    # Don't add dependency if it's just an index file re-export
                    if import_name.lower() == 'index':
                        continue
                        
                    dependencies[file_node].add(import_name)

    for root, dirs, files in os.walk(src_path):
        if not should_process_directory(root, project_path):
            dirs[:] = []
            continue
            
        for file in files:
            if should_process_file(file):
                file_path = os.path.join(root, file)
                print(f"Processing: {os.path.relpath(file_path, project_path)}")
                process_file(file_path)
                
    return dependencies

def generate_excalidraw_json(dependencies: Dict[str, Set[str]]) -> str:
    """Converts dependencies to Excalidraw-compatible JSON format."""
    excalidraw_data = {
        "type": "excalidraw",
        "version": 2,
        "source": "dependency-analyzer",
        "elements": []
    }
    
    # Calculate non-overlapping positions
    positions = calculate_node_positions(set(dependencies.keys()))
    
    # Create nodes
    node_elements = {}
    node_rectangles = {}
    
    for i, (node, pos) in enumerate(positions.items()):
        file_type = get_file_type(node)
        rectangle, text, rect_id = create_node_element(node, pos, i, file_type)
        
        node_elements[node] = rect_id
        node_rectangles[rect_id] = rectangle
        
        excalidraw_data["elements"].extend([rectangle, text])
    
    # Create arrows
    for source, targets in dependencies.items():
        if source in node_elements:
            source_rect_id = node_elements[source]
            source_rect = node_rectangles[source_rect_id]
            
            for target in targets:
                if target in node_elements:
                    target_rect_id = node_elements[target]
                    target_rect = node_rectangles[target_rect_id]
                    
                    arrow_id = f"arrow_{source_rect_id}_{target_rect_id}"
                    arrow = create_arrow_element(source_rect, target_rect, arrow_id)
                    excalidraw_data["elements"].append(arrow)
                    
                    source_rect["boundElements"].append({
                        "id": arrow_id,
                        "type": "arrow"
                    })
                    
                    if "boundElements" not in target_rect:
                        target_rect["boundElements"] = []
                    target_rect["boundElements"].append({
                        "id": arrow_id,
                        "type": "arrow"
                    })
    
    return json.dumps(excalidraw_data, indent=2)

def main():
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python dependency_analyzer.py <project_path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    print(f"Analyzing dependencies in {project_path}...")
    dependencies = analyze_dependencies(project_path)
    
    if not dependencies:
        print("No dependencies found to analyze.")
        return
        
    excalidraw_json = generate_excalidraw_json(dependencies)
    
    output_file = "dependencies.excalidraw"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(excalidraw_json)
    
    print(f"\nAnalysis complete!")
    print(f"Total files with dependencies: {len(dependencies)}")
    print(f"Dependency diagram saved to: {output_file}")
    print("\nColor coding:")
    print("🟢 Green: App.tsx (Entry point)")
    print("🔵 Blue: Pages")
    print("🟠 Orange: Context files")
    print("🟣 Purple: Services/API")
    print("🟤 Deep Orange: Types/Interfaces")
    print("⚪ White: Other files")

if __name__ == "__main__":
    main()