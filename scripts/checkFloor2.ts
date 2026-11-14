// Script to inspect Floor 2 walls and floors geometry
import fs from 'fs';

const content = fs.readFileSync('src/components/3d/MultiplayerSchoolFloor.tsx', 'utf-8');

// Extract Floor 2 section
const startIdx = content.indexOf('currentFloor === 2 && (');
const endIdx = content.indexOf('currentFloor === 1 && (');
const f2Content = content.substring(startIdx, endIdx);

console.log('--- FLOOR 2 CODE EXTRACTED ---');

// Find all meshes with position and geometry
const regex = /<mesh\s+position=\{\[([-\d.,\s]+)\]\}([^>]*)>[\s\S]*?<(planeGeometry|boxGeometry)\s+args=\{\[([-\d.,\s]+)\]\}/g;
let match;
const meshes = [];

while ((match = regex.exec(f2Content)) !== null) {
  const pos = match[1].split(',').map(s => parseFloat(s.trim()));
  const extra = match[2];
  const geoType = match[3];
  const args = match[4].split(',').map(s => parseFloat(s.trim()));
  
  meshes.push({ pos, geoType, args, extra });
}

console.log(`Found ${meshes.length} geometry meshes in Floor 2:`);
for (const m of meshes) {
  if (m.geoType === 'boxGeometry') {
    const [w, h, d] = m.args;
    const [x, y, z] = m.pos;
    const minX = x - w/2;
    const maxX = x + w/2;
    const minZ = z - d/2;
    const maxZ = z + d/2;
    console.log(`WALL: center=(${x}, ${y}, ${z}) size=(${w}, ${h}, ${d}) => X:[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Z:[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
  } else if (m.geoType === 'planeGeometry') {
    const [w, d] = m.args;
    const [x, y, z] = m.pos;
    const minX = x - w/2;
    const maxX = x + w/2;
    const minZ = z - d/2;
    const maxZ = z + d/2;
    console.log(`FLOOR/CEIL: center=(${x}, ${y}, ${z}) size=(${w}, ${d}) => X:[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Z:[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
  }
}
