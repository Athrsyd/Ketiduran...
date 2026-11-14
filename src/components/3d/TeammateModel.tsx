/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerData } from '../../types/game';

interface TeammateModelProps {
  player: PlayerData;
}

export const TeammateModel: React.FC<TeammateModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const prevPosRef = useRef<[number, number]>([player.position[0], player.position[2]]);
  const walkTimeRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;

    // Smoothly interpolate position towards target at 60 FPS
    g.position.x = THREE.MathUtils.damp(g.position.x, player.position[0], 12, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, player.position[1] - 1.6, 12, delta); // ground offset
    g.position.z = THREE.MathUtils.damp(g.position.z, player.position[2], 12, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, player.yaw, 12, delta);

    // Compute horizontal movement velocity to trigger natural walking animation
    const dx = g.position.x - prevPosRef.current[0];
    const dz = g.position.z - prevPosRef.current[1];
    prevPosRef.current[0] = g.position.x;
    prevPosRef.current[1] = g.position.z;

    const moveDist = Math.hypot(dx, dz);
    const isMoving = moveDist > 0.005;

    if (isMoving) {
      walkTimeRef.current += delta * 11.0;
    }

    const swing = isMoving ? Math.sin(walkTimeRef.current) * 0.45 : 0;
    const armSwing = isMoving ? Math.sin(walkTimeRef.current) * 0.4 : 0;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, swing, 14, delta);
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, -swing, 14, delta);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -armSwing, 14, delta);
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, armSwing, 14, delta);
    }
  });

  const isFemale = player.gender === 'female';
  const accentColor = player.color || '#38bdf8';
  const displayName = player.name || (isFemale ? 'Siswi SMK' : 'Siswa SMK');

  return (
    <group ref={groupRef} position={[player.position[0], player.position[1] - 1.6, player.position[2]]}>
      {/* ========================================================
          1. LEGS & SKIRT (PIVOT AT HIPS Y = 0.75)
          ======================================================== */}
      {/* Female: Indonesian SMK Long Grey Skirt (Rok Panjang Rempel Abu-abu) */}
      {isFemale && (
        <group position={[0, 0.52, 0]}>
          <mesh>
            <cylinderGeometry args={[0.24, 0.33, 0.72, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.85} />
          </mesh>
          {/* Subtle front pleat wiron detail */}
          <mesh position={[0, 0, 0.17]}>
            <boxGeometry args={[0.04, 0.70, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Left Leg */}
      <group ref={leftLegRef} position={[isFemale ? -0.11 : -0.15, 0.75, 0]}>
        {/* Grey Trousers (Male) or Tights/Socks (Female) */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[isFemale ? 0.065 : 0.08, isFemale ? 0.06 : 0.07, 0.7, 8]} />
          <meshStandardMaterial color={isFemale ? '#cbd5e1' : '#475569'} roughness={0.8} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.7, 0.04]}>
          <boxGeometry args={[isFemale ? 0.11 : 0.13, 0.1, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[isFemale ? 0.11 : 0.15, 0.75, 0]}>
        {/* Grey Trousers (Male) or Tights/Socks (Female) */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[isFemale ? 0.065 : 0.08, isFemale ? 0.06 : 0.07, 0.7, 8]} />
          <meshStandardMaterial color={isFemale ? '#cbd5e1' : '#475569'} roughness={0.8} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.7, 0.04]}>
          <boxGeometry args={[isFemale ? 0.11 : 0.13, 0.1, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* ========================================================
          2. TORSO & UNIFORM (BAJU OSIS SMK PUTIH)
          ======================================================== */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.52, 0.65, 0.3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* OSIS Pocket badge on chest */}
      <mesh position={[-0.14, 1.25, 0.16]}>
        <planeGeometry args={[0.07, 0.09]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>

      {/* Red-White Indonesian Flag Ribbon Badge */}
      <group position={[0.14, 1.25, 0.16]}>
        <mesh position={[0, 0.02, 0]}>
          <planeGeometry args={[0.06, 0.03]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <planeGeometry args={[0.06, 0.03]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* Student Backpack (Tas Ransel dengan Warna Profil Pemain) */}
      <mesh position={[0, 1.15, -0.2]}>
        <boxGeometry args={[0.4, 0.48, 0.18]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {/* ========================================================
          3. ARMS & FLASHLIGHT (PIVOT AT SHOULDERS Y = 1.38)
          ======================================================== */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.32, 1.38, 0]}>
        {/* Sleeve (Long for female, Short for male) */}
        <mesh position={[0, isFemale ? -0.22 : -0.12, 0]}>
          <cylinderGeometry args={[0.08, 0.075, isFemale ? 0.46 : 0.25, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Forearm & Hand */}
        <mesh position={[0, isFemale ? -0.47 : -0.36, 0]}>
          <cylinderGeometry args={[0.055, 0.05, isFemale ? 0.12 : 0.32, 8]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm with Flashlight */}
      <group ref={rightArmRef} position={[0.32, 1.38, 0]}>
        {/* Sleeve (Long for female, Short for male) */}
        <mesh position={[0, isFemale ? -0.22 : -0.12, 0]}>
          <cylinderGeometry args={[0.08, 0.075, isFemale ? 0.46 : 0.25, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Forearm & Hand */}
        <mesh position={[0, isFemale ? -0.47 : -0.36, 0]}>
          <cylinderGeometry args={[0.055, 0.05, isFemale ? 0.12 : 0.32, 8]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>
        {/* Flashlight Body in Hand */}
        <mesh position={[0, -0.5, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.035, 0.18, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Flashlight Emissive Lens */}
        <mesh position={[0, -0.5, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.034, 12]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        {/* Soft atmospheric teammate flashlight beam */}
        <pointLight position={[0, -0.5, 0.3]} color="#e0f2fe" intensity={0.8} distance={8} decay={2} />
      </group>

      {/* ========================================================
          4. HEAD & HAIR / HIJAB (OSIS KERUDUNG SISWI SMK)
          ======================================================== */}
      {isFemale ? (
        <group>
          {/* 1. Visible Face & Head Base (Kulit Wajah Terbuka Jelas) */}
          <mesh position={[0, 1.62, 0.02]}>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>

          {/* Facial Features: Eyes, Eyebrows & Cheerful Smile */}
          {/* Left Eye */}
          <mesh position={[-0.06, 1.62, 0.153]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.06, 1.62, 0.153]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Left Eyebrow */}
          <mesh position={[-0.06, 1.66, 0.154]}>
            <boxGeometry args={[0.035, 0.008, 0.004]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
          {/* Right Eyebrow */}
          <mesh position={[0.06, 1.66, 0.154]}>
            <boxGeometry args={[0.035, 0.008, 0.004]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
          {/* Cheerful Soft Smile */}
          <mesh position={[0, 1.55, 0.154]}>
            <boxGeometry args={[0.05, 0.012, 0.004]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>

          {/* 2. White OSIS Hijab Framing the Face (Kerudung Membingkai Wajah Tanpa Menutup) */}
          {/* Top Cap of Hijab */}
          <mesh position={[0, 1.76, -0.01]}>
            <boxGeometry args={[0.31, 0.06, 0.31]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Forehead Pet / Visor (Membingkai Bagian Atas Dahi) */}
          <mesh position={[0, 1.74, 0.11]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[0.27, 0.035, 0.08]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Inner Ciput Band di atas dahi */}
          <mesh position={[0, 1.70, 0.148]}>
            <boxGeometry args={[0.24, 0.022, 0.016]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          {/* Left Cheek Wrap (Pipi Kiri) */}
          <mesh position={[-0.145, 1.61, 0.01]}>
            <boxGeometry args={[0.045, 0.25, 0.28]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Right Cheek Wrap (Pipi Kanan) */}
          <mesh position={[0.145, 1.61, 0.01]}>
            <boxGeometry args={[0.045, 0.25, 0.28]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Back of Head */}
          <mesh position={[0, 1.62, -0.14]}>
            <boxGeometry args={[0.31, 0.26, 0.05]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Under-chin closure (Di Bawah Dagu) */}
          <mesh position={[0, 1.48, 0.10]}>
            <boxGeometry args={[0.20, 0.04, 0.07]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Hijab Drape Cowl over Neck & Upper Chest */}
          <mesh position={[0, 1.34, 0.02]}>
            <cylinderGeometry args={[0.18, 0.32, 0.24, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Hijab Back Drape */}
          <mesh position={[0, 1.32, -0.15]}>
            <boxGeometry args={[0.32, 0.24, 0.06]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Male Student Head */}
          <mesh position={[0, 1.62, 0]}>
            <boxGeometry args={[0.30, 0.32, 0.30]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>
          {/* Male Face Features */}
          {/* Left Eye */}
          <mesh position={[-0.06, 1.62, 0.153]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.06, 1.62, 0.153]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Left Eyebrow */}
          <mesh position={[-0.06, 1.66, 0.154]}>
            <boxGeometry args={[0.035, 0.008, 0.004]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Right Eyebrow */}
          <mesh position={[0.06, 1.66, 0.154]}>
            <boxGeometry args={[0.035, 0.008, 0.004]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Cheerful Smile */}
          <mesh position={[0, 1.55, 0.154]}>
            <boxGeometry args={[0.05, 0.012, 0.004]} />
            <meshBasicMaterial color="#334155" />
          </mesh>

          {/* Male Student Short Black Hair */}
          <mesh position={[0, 1.80, -0.01]}>
            <boxGeometry args={[0.32, 0.10, 0.32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Hair back trim */}
          <mesh position={[0, 1.67, -0.15]}>
            <boxGeometry args={[0.31, 0.18, 0.05]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Sideburns */}
          <mesh position={[-0.145, 1.66, 0.01]}>
            <boxGeometry args={[0.02, 0.14, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0.145, 1.66, 0.01]}>
            <boxGeometry args={[0.02, 0.14, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          5. BILLBOARD NAMETAG & BEACON (ALWAYS FACES CAMERA)
          ======================================================== */}
      <Billboard position={[0, 2.22, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Floating Glowing Diamond Beacon above head */}
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Nametag Background Badge */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.5, 0.36]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.88} />
        </mesh>

        {/* Accent Color Bottom Bar */}
        <mesh position={[0, -0.15, 0.005]}>
          <planeGeometry args={[1.42, 0.04]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* 3D Student Display Name */}
        <Text
          position={[0, 0.03, 0.01]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
        >
          {displayName}
        </Text>
      </Billboard>
    </group>
  );
};
