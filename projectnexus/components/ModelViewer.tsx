import React, { Suspense } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, Bounds, Center, OrbitControls } from '@react-three/drei/native';

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
  if (!modelSource) {
    return (
      <View style={styles.fallback}>
        <Text style={{ color: 'white' }}>Model URL is missing.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <GlbModel source={modelSource} />
            </Center>
          </Bounds>
        </Suspense>
        
        <OrbitControls enableZoom={true} enablePan={false} enableRotate={true} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

