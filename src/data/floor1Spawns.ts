/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MasterKeySpawnLocation {
  id: string;
  name: string;
  hint: string;
  multiPos: [number, number, number];
  soloPos: [number, number, number];
}

export const MASTER_KEY_SPAWNS: MasterKeySpawnLocation[] = [
  {
    id: 'pos_satpam',
    name: 'Pos Satpam',
    hint: 'Kunci gerbang utama terlihat berkilau di atas meja Pos Satpam!',
    multiPos: [-22, 0.95, -85],
    soloPos: [-18, 0.95, -56],
  },
  {
    id: 'podium_bendera',
    name: 'Podium Tiang Bendera',
    hint: 'Kunci gerbang utama diletakkan di undakan dasar tiang bendera upacara!',
    multiPos: [0, 0.85, -32],
    soloPos: [0, 0.85, -32],
  },
  {
    id: 'kantin_sekolah',
    name: 'Meja Kantin Sekolah',
    hint: 'Seseorang meninggalkan kunci gerbang di salah satu meja makan kantin sekolah!',
    multiPos: [-38, 0.85, -24.5],
    soloPos: [-32, 0.85, -40],
  },
  {
    id: 'gazebo_taman',
    name: 'Gazebo & Taman Air',
    hint: 'Kunci gerbang utama terselip di lantai kayu gazebo santai dekat taman!',
    multiPos: [18, 0.85, -60],
    soloPos: [-14, 0.85, -80],
  },
  {
    id: 'tribune_lapangan',
    name: 'Tribune Lapangan Olahraga',
    hint: 'Kunci gerbang utama berkilau di deretan tempat duduk tribune penonton!',
    multiPos: [42, 0.95, -74],
    soloPos: [28, 0.95, -60],
  },
  {
    id: 'kanopi_parkir',
    name: 'Area Kanopi Parkir',
    hint: 'Kunci gerbang utama tergeletak di bawah kanopi deretan parkir kendaraan!',
    multiPos: [-40, 0.85, -110],
    soloPos: [-26, 0.85, -68],
  },
];

export const getMasterKeySpawn = (index: number, isMultiplayer: boolean) => {
  const safeIndex =
    typeof index === 'number' && index >= 0 && index < MASTER_KEY_SPAWNS.length
      ? index
      : 0;
  const spawn = MASTER_KEY_SPAWNS[safeIndex];
  return {
    ...spawn,
    position: isMultiplayer ? spawn.multiPos : spawn.soloPos,
  };
};
