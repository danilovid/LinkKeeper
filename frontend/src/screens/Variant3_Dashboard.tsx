import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { apiClient } from '../api/client';
import { Link } from '../types';

/**
 * VARIANT 3: Dashboard with statistics
 * 
 * Features:
 * - Link statistics (total, viewed, by resources)
 * - Quick access to random links
 * - Compact list with search
 * - Focus on analytics
 */
export default function Variant3_Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newResource, setNewResource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listLinks(50, 0);
      setLinks(data);
    } catch (error) {
      Alert.alert('Error', `Failed to load links: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!newUrl.trim()) {
      Alert.alert('Error', 'URL is required');
      return;
    }
    try {
      await apiClient.createLink({
        url: newUrl.trim(),
        resource: newResource.trim() || undefined,
      });
      setNewUrl('');
      setNewResource('');
      await loadLinks();
    } catch (error) {
      Alert.alert('Error', `Failed to create: ${error}`);
    }
  };

  const handleGetRandom = async (resource?: string) => {
    try {
      const link = await apiClient.getRandomLink(resource);
      Alert.alert('Random Link', link.url, [
        { text: 'OK' },
        {
          text: 'Mark Viewed',
          onPress: async () => {
            await apiClient.markViewed(link.id);
            await loadLinks();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', `Failed: ${error}`);
    }
  };

  const stats = {
    total: links.length,
    viewed: links.filter((l) => l.views > 0).length,
    resources: new Set(links.map((l) => l.resource).filter(Boolean)).size,
    totalViews: links.reduce((sum, l) => sum + l.views, 0),
  };

  const resources = Array.from(
    new Set(links.map((l) => l.resource).filter(Boolean))
  );

  const filteredLinks = searchQuery
    ? links.filter(
        (l) =>
          l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.resource?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : links;

  return (
    <ScrollView style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Links</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.viewed}</Text>
          <Text style={styles.statLabel}>Viewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.resources}</Text>
          <Text style={styles.statLabel}>Resources</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleGetRandom()}
          >
            <Text style={styles.quickActionText}>🎲 Random</Text>
          </TouchableOpacity>
          {resources.slice(0, 3).map((resource) => (
            <TouchableOpacity
              key={resource}
              style={styles.quickAction}
              onPress={() => handleGetRandom(resource || undefined)}
            >
              <Text style={styles.quickActionText}>{resource}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add Link */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Link</Text>
        <TextInput
          style={styles.input}
          placeholder="URL"
          value={newUrl}
          onChangeText={setNewUrl}
        />
        <TextInput
          style={styles.input}
          placeholder="Resource"
          value={newResource}
          onChangeText={setNewResource}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateLink}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search links..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Links List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Links ({filteredLinks.length})
        </Text>
        {filteredLinks.map((link) => (
          <LinkRow key={link.id} link={link} onRefresh={loadLinks} />
        ))}
      </View>
    </ScrollView>
  );
}

function LinkRow({ link, onRefresh }: { link: Link; onRefresh: () => void }) {
  const handleMarkViewed = async () => {
    try {
      await apiClient.markViewed(link.id);
      onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as viewed');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteLink(link.id);
            onRefresh();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.linkRow}>
      <View style={styles.linkRowContent}>
        <Text style={styles.linkRowUrl} numberOfLines={1}>
          {link.url}
        </Text>
        <View style={styles.linkRowMeta}>
          {link.resource && (
            <Text style={styles.linkRowResource}>{link.resource}</Text>
          )}
          <Text style={styles.linkRowViews}>👁 {link.views}</Text>
        </View>
      </View>
      <View style={styles.linkRowActions}>
        <TouchableOpacity
          style={styles.linkRowAction}
          onPress={handleMarkViewed}
        >
          <Text>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.linkRowAction, styles.linkRowActionDelete]}
          onPress={handleDelete}
        >
          <Text>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickActionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkRowContent: {
    flex: 1,
  },
  linkRowUrl: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  linkRowMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  linkRowResource: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkRowViews: {
    fontSize: 12,
    color: '#999',
  },
  linkRowActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  linkRowAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkRowActionDelete: {
    backgroundColor: '#f44336',
  },
});
