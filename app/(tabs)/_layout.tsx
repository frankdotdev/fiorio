import { Tabs } from 'expo-router';
import { Compass, Globe2, Map, Heart, User } from 'lucide-react-native';
import { useTheme } from '@/ui/kit';

export default function TabsLayout() {
  const t = useTheme();
  const icon = (I: any) => ({ color, size }: { color: string; size: number }) => <I color={color} size={size} strokeWidth={1.75} />;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: t.ink, tabBarInactiveTintColor: t.sub, tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line }, tabBarLabelStyle: { fontSize: 11 } }}>
    <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: icon(Compass) }} />
    <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon(Globe2) }} />
    <Tabs.Screen name="trips" options={{ title: 'Trips', tabBarIcon: icon(Map) }} />
    <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: icon(Heart) }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon(User) }} />
  </Tabs>;
}
