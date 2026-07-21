"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PitchScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 7.8, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10, 16, 10),
      new THREE.MeshStandardMaterial({
        color: 0x0c3b2c,
        metalness: 0.05,
        roughness: 0.82,
        emissive: 0x062216,
        emissiveIntensity: 0.42
      })
    );
    pitch.rotation.x = -Math.PI / 2;
    scene.add(pitch);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x82f45f,
      transparent: true,
      opacity: 0.45
    });

    const addLine = (points: THREE.Vector3[]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      return line;
    };

    const y = 0.012;
    addLine([
      new THREE.Vector3(-8, y, -5),
      new THREE.Vector3(8, y, -5),
      new THREE.Vector3(8, y, 5),
      new THREE.Vector3(-8, y, 5),
      new THREE.Vector3(-8, y, -5)
    ]);
    addLine([new THREE.Vector3(0, y, -5), new THREE.Vector3(0, y, 5)]);
    addLine([new THREE.Vector3(-8, y, -2.6), new THREE.Vector3(-5.3, y, -2.6), new THREE.Vector3(-5.3, y, 2.6), new THREE.Vector3(-8, y, 2.6)]);
    addLine([new THREE.Vector3(8, y, -2.6), new THREE.Vector3(5.3, y, -2.6), new THREE.Vector3(5.3, y, 2.6), new THREE.Vector3(8, y, 2.6)]);

    const circlePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i += 1) {
      const angle = (i / 96) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(Math.cos(angle) * 1.35, y, Math.sin(angle) * 1.35));
    }
    addLine(circlePoints);

    const grid = new THREE.GridHelper(16, 16, 0x82f45f, 0x1d6b45);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 2.1);
    light.position.set(-3, 8, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x9fc7ff, 0.9));

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      pitch.rotation.z = Math.sin(Date.now() * 0.00035) * 0.015;
      grid.rotation.z = pitch.rotation.z;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="pitch-scene" ref={mountRef} aria-hidden="true" />;
}
