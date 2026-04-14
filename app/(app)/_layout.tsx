import React from 'react'
import { Tabs } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { VelaIcon } from '../../src/components/shared/VelaIcon'

export default function AppLayout() {
  const Colors = useColors()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  Colors.tabBackground,
          borderTopColor:   Colors.border,
          borderTopWidth:   1,
          paddingBottom:    10,
          paddingTop:       8,
          height:           68,
        },
        tabBarActiveTintColor:   Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          marginTop:  4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <VelaIcon name={focused ? 'tab-home-active' : 'tab-home'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, focused }) => (
            <VelaIcon name={focused ? 'tab-log-active' : 'tab-log'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <VelaIcon name={focused ? 'heart-filled' : 'heart'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <VelaIcon name={focused ? 'tab-insights-active' : 'tab-insights'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <VelaIcon name={focused ? 'tab-settings-active' : 'tab-settings'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="(settings)" options={{ href: null }} />
    </Tabs>
  )
}

