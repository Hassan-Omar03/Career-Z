import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Real, interactive 3D campus map (spec Part 11.12) — every building is rendered from the
// institution's own real data (name/type/position/floors/description), not a stock scene. This
// is a WebGL 3D map for orientation/wayfinding, not 360° photography — an institution without
// panorama camera equipment can still build a real, working tour just by naming its buildings.
export default function CampusTourViewer({ buildings, height = 420 }) {
  const mountRef = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !buildings || buildings.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef2f0);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / height, 0.1, 1000);
    camera.position.set(18, 16, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1; // keep the camera from going below ground

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(20, 30, 10);
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0xcfe8d8 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    scene.add(new THREE.GridHelper(60, 30, 0x9db8a8, 0xb9d2c2));

    const meshes = [];
    buildings.forEach((b) => {
      const w = b.width || 4, d = b.depth || 4, h = Math.max((b.floors || 1) * 2.4, 2.4);
      const geometry = new THREE.BoxGeometry(w, h, d);
      const material = new THREE.MeshStandardMaterial({ color: b.color || '#4b7bec' });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(b.positionX || 0, h / 2, b.positionZ || 0);
      mesh.userData.building = b;
      scene.add(mesh);
      meshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function onClick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes)[0];
      setSelected(hit ? hit.object.userData.building : null);
    }
    renderer.domElement.addEventListener('click', onClick);

    function onResize() {
      camera.aspect = mount.clientWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, height);
    }
    window.addEventListener('resize', onResize);

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      meshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      ground.geometry.dispose(); ground.material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [buildings, height]);

  if (!buildings || buildings.length === 0) {
    return <p className="admin-notice">No buildings added to the campus tour yet.</p>;
  }

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--sand-line)', cursor: 'grab' }} />
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Drag to rotate, scroll to zoom, click a building for details.</p>
      {selected && (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <div className="flex items-center justify-between" style={{ gap: 12 }}>
            <div>
              <strong>{selected.name}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{selected.type} · {selected.floors || 1} floor{(selected.floors || 1) > 1 ? 's' : ''}</p>
            </div>
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>Close</button>
          </div>
          {selected.description && <p className="text-sm" style={{ marginTop: 10 }}>{selected.description}</p>}
          {selected.photo && <img src={selected.photo} alt={selected.name} style={{ marginTop: 10, borderRadius: 10, maxHeight: 200 }} />}
        </div>
      )}
    </div>
  );
}
