import React, { Suspense, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, Bounds, Center, OrbitControls } from '@react-three/drei/native';

class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.warn("3D Model loading error caught:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// modelSource: require() → number (bundled asset) veya string (remote URL)
type ModelSource = string | number;

function GlbModel({ source }: { source: ModelSource }) {
  // useGLTF, Expo ortamında hem asset ID (number) hem de URL (string) kabul eder
  const gltf = useGLTF(source as any) as any;
  return <primitive object={gltf.scene} />;
}

interface ModelViewerProps {
  modelSource: ModelSource | null;
}

export default function ModelViewer({ modelSource }: ModelViewerProps) {
  const orbitRef = useRef<any>(null);
  const [bgIndex, setBgIndex] = useState(-1);

  const backgrounds = [
    require('../assets/images/room1.jpg'),
    require('../assets/images/room2.jpg'),
    require('../assets/images/room3.jpg')
  ];

  const handleZoom = (zoomIn: boolean) => {
    if (orbitRef.current && orbitRef.current.object) {
      const camera = orbitRef.current.object;
      camera.position.multiplyScalar(zoomIn ? 0.8 : 1.25);
      camera.updateProjectionMatrix();
      orbitRef.current.update();
    }
  };

  if (!modelSource) {
    return (
      <View style={styles.fallback}>
        <Text style={{ color: 'white' }}>Model URL is missing.</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={bgIndex !== -1 ? backgrounds[bgIndex] : undefined} 
      style={[styles.container, bgIndex !== -1 && { backgroundColor: 'transparent' }]}
      resizeMode="cover"
    >
      <ErrorBoundary fallback={
        <View style={styles.fallback}>
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Model yüklenemedi. Lütfen internet bağlantınızı veya sunucu adresini (http://192.168.0.4:8000) kontrol edin.
          </Text>
        </View>
      }>
        <Canvas 
          gl={{ alpha: true, physicallyCorrectLights: true }} 
          onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
          style={{ flex: 1, backgroundColor: 'transparent' }} 
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <GlbModel source={modelSource} />
              </Center>
            </Bounds>
          </Suspense>
          
          <OrbitControls ref={orbitRef} enableZoom={true} enablePan={false} enableRotate={true} />
        </Canvas>
      </ErrorBoundary>

      <View style={styles.controlsOverlay}>
        <TouchableOpacity style={styles.btn} onPress={() => setBgIndex((prev) => prev === backgrounds.length - 1 ? -1 : prev + 1)}>
          <Text style={styles.btnText}>🏔️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => handleZoom(true)}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => handleZoom(false)}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  btn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  }
});

