import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '@/db';
import { hydrate } from '@/lib/auth';
import { useSession } from '@/store/session';

function Boot() {
  const db = useSQLiteContext(), dark = useSession((s) => s.dark);
  useEffect(() => { hydrate(db); }, [db]);
  return <><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} /></>;
}
export default function Root() {
  return <SQLiteProvider databaseName="fiorio.db" onInit={initDb}><Boot /></SQLiteProvider>;
}
