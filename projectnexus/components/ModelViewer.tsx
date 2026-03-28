import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 3D componentleri şimdilik devre dışı bırakıldı (Metro bundling 100% hatasını çözmek için)
// 
// import { Canvas } from '@react-three/fiber/native';
// import { useGLTF, Bounds, Center } from '@react-three/drei/native';

export default function ModelViewer({ modelSource }: { modelSource: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>100% Bundling Hatası yüzünden 3D Model geçici olarak kapatılmıştır.</Text>
      <Text style={styles.subtext}>URL: {typeof modelSource === 'string' ? modelSource : 'Local GLB'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  }
});
