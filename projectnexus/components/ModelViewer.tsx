import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as THREE from 'three';

import { Colors } from '@/constants/theme';

interface ModelViewerProps {
  modelSource: number | string;
}

function Model({ uri }: { uri: string }) {
  const { scene } = useGLTF(uri);
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    if (box.isEmpty()) {
      return;
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxAxis = Math.max(size.x, size.y, size.z);
    const targetSize = 1.6;
    const scale = maxAxis > 0 ? targetSize / maxAxis : 1;

    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [model]);

  return <primitive object={model} />;
}

function Loading() {
  return (
    <View style={styles.loadingOverlay} pointerEvents="none">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export default function ModelViewer({ modelSource }: ModelViewerProps) {
  const [modelUri, setModelUri] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function resolveModelAsset() {
      if (typeof modelSource === 'string') {
        if (mounted) setModelUri(modelSource);
        return;
      }
      
      try {
        const asset = Asset.fromModule(modelSource);
        await asset.downloadAsync();
        if (mounted) {
          setModelUri(asset.localUri ?? asset.uri);
        }
      } catch {
        if (mounted) {
          setLoadError('Model yüklenemedi. Farklı bir model ile tekrar dene.');
        }
      }
    }

    resolveModelAsset();

    return () => {
      mounted = false;
    };
  }, [modelSource]);

  if (!modelUri) {
    return (
      <View style={styles.container}>
        <Loading />
        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Model uri={modelUri} />
        </Suspense>
        <OrbitControls makeDefault enablePan={false} enableZoom enableRotate enableDamping />
      </Canvas>
      {loadError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 340,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  errorText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 12,
  },
});
