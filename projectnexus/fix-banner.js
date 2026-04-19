const fs = require('fs');
let file = './app/(tabs)/index.tsx';
let source = fs.readFileSync(file, 'utf-8');

if (!source.includes('Image,')) {
    source = source.replace(/TouchableOpacity,\n\} from 'react-native';/, "TouchableOpacity,\n  Image,\n} from 'react-native';");
}

const bannerJSX = <URLInput onSubmit={handleSearch} />

      {/* Tanitim Afisi */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Yeni Sezon Sok Indirimler!</Text>
          <Text style={styles.bannerSubtitle}>Odaniza en uyan akilli ürünleri kesfedin</Text>
        </View>
      </View>

      <View style={styles.categoriesSection}>;

// Direct replace with careful spaces
source = source.replace(/<URLInput onSubmit=\{handleSearch\} \/>\s*<View style=\{styles\.categoriesSection\}>/, bannerJSX);

if (!source.includes('bannerContainer')) {
    const bannerStyles = annerContainer: {
    height: 150,
    marginTop: Spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: 32,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  bannerSubtitle: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  categoriesSection:;

    source = source.replace('  categoriesSection:', bannerStyles);
    fs.writeFileSync(file, source);
    console.log('Successfully injected banner.');
} else {
    console.log('Banner already present.');
}
