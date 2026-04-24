import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
 
export function RegistroScreen() {
  return (
    <View style={styles.contenedor}>
      <RegistroProyectoForm onSuccess={() => router.back()} />
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: { flex: 1 },
});