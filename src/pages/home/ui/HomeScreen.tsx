import { ListaProyectos } from '@features/lista-proyectos/ui/ListaProyectos';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
 
export function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerContenedor}>
        <Image
          source={require('../../../../assets/images/logo_esfot_buho.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.header}>Proyectos de Tesis — ESFOT</Text>
      </View>
      <View style={styles.buscadorContenedor}>
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar por título..."
          placeholderTextColor="#8E98A8"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="sentences"
          returnKeyType="search"
        />
      </View>
      <ListaProyectos searchQuery={busqueda} />
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  headerContenedor: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6EE',
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 4,
  },
  header: { fontSize: 20, fontWeight: '700', color: '#1A3A5C',
    paddingHorizontal: 16, textAlign: 'center' },
  buscadorContenedor: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  buscadorInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
});