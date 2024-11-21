import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';

import state from '../store';

const CameraRig = ({ children }) => {
  const group = useRef();
  const snap = useSnapshot(state);

  const [isDragging, setIsDragging] = useState(false); // Track dragging state
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 }); // Store last mouse position

  const handlePointerDown = (event) => {
    setIsDragging(true);
    setLastPointer({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastPointer.x; // Calculate mouse movement on the X-axis
    const deltaY = event.clientY - lastPointer.y; // Calculate mouse movement on the Y-axis

    // Update rotation based on mouse movement
    state.pointer = {
      x: state.pointer?.x + deltaX * 0.005, // Adjust sensitivity
      y: state.pointer?.y + deltaY * 0.005,
    };

    setLastPointer({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useFrame((state, delta) => {
    const isBreakpoint = window.innerWidth <= 1260;
    const isMobile = window.innerWidth <= 600;

    // Set the initial position of the model
    let targetPosition = [-0.4, 0, 2];
    if (snap.intro) {
      if (isBreakpoint) targetPosition = [0, 0, 2];
      if (isMobile) targetPosition = [0, 0.2, 2.5];
    } else {
      if (isMobile) targetPosition = [0, 0, 2.5];
      else targetPosition = [0, 0, 2];
    }

    // Smoothly update the camera position
    easing.damp3(state.camera.position, targetPosition, 0.25, delta);

    // Smoothly update the T-shirt model's rotation based on pointer position
    if (group.current) {
      const { x = 0, y = 0 } = state.pointer || {}; // Default pointer position
      easing.dampE(
        group.current.rotation,
        [y / 5, -x / 5, 0], // Adjust rotation sensitivity
        0.25,
        delta
      );
    }
  });

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown} // Start dragging
      onPointerMove={handlePointerMove} // Rotate during dragging
      onPointerUp={handlePointerUp} // Stop dragging
      onPointerLeave={handlePointerUp} // Stop dragging if mouse leaves
    >
      {children}
    </group>
  );
};

export default CameraRig;
