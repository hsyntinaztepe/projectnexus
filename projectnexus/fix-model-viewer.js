const fs = require('fs');
let file = './components/ModelViewer.tsx';
let source = fs.readFileSync(file, 'utf-8');

const boundaryCode = \
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean, errorMsg: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.warn("Model loading error caught by boundary:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
\;

source = source.replace(/function GlbModel/, boundaryCode + '\nfunction GlbModel');

const newReturn = \  return (
    <View style={styles.container}>
      <ErrorBoundary fallback={
        <View style={styles.fallback}>
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Model yüklenemedi. Ag baglantisini veya model sunucusunu kontrol edin.
          </Text>
        </View>
      }>
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
      </ErrorBoundary>
    </View>
  );\;

source = source.replace(/  return \(\n    <View style=\{styles\.container\}>[\s\S]*?    <\/View>\n  \);/, newReturn);

fs.writeFileSync(file, source);
