import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../api/client';
import { Link } from '../types';

export default function HomeScreen() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newResource, setNewResource] = useState('');
  const [randomLink, setRandomLink] = useState<Link | null>(null);
  const [filterResource, setFilterResource] = useState('');

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
      setLoading(true);
      const link = await apiClient.createLink({
        url: newUrl.trim(),
        resource: newResource.trim() || undefined,
      });
      setNewUrl('');
      setNewResource('');
      await loadLinks();
      Alert.alert('Success', 'Link created successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to create link: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRandom = async () => {
    try {
      setLoading(true);
      const link = await apiClient.getRandomLink(
        filterResource.trim() || undefined
      );
      setRandomLink(link);
    } catch (error) {
      Alert.alert('Error', `Failed to get random link: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.markViewed(id);
      await loadLinks();
      if (randomLink?.id === id) {
        const updated = await apiClient.getLink(id);
        setRandomLink(updated);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to mark as viewed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Link',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.deleteLink(id);
              await loadLinks();
              if (randomLink?.id === id) {
                setRandomLink(null);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to delete link: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {/* Create Link Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add New Link</Text>
        <TextInput
          style={styles.input}
          placeholder="URL"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextInput
          style={styles.input}
          placeholder="Resource (optional)"
          value={newResource}
          onChangeText={setNewResource}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateLink}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Link</Text>
        </TouchableOpacity>
      </View>

      {/* Random Link Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Random Link</Text>
        <TextInput
          style={styles.input}
          placeholder="Filter by resource (optional)"
          value={filterResource}
          onChangeText={setFilterResource}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetRandom}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Random Link</Text>
        </TouchableOpacity>
        {randomLink && (
          <View style={styles.linkCard}>
            <Text style={styles.linkUrl}>{randomLink.url}</Text>
            {randomLink.resource && (
              <Text style={styles.linkResource}>Resource: {randomLink.resource}</Text>
            )}
            <Text style={styles.linkMeta}>
              Views: {randomLink.views} | Created: {formatDate(randomLink.created_at)}
            </Text>
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => handleMarkViewed(randomLink.id)}
              >
                <Text style={styles.actionButtonText}>Mark Viewed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(randomLink.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Links List Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Links ({links.length})</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadLinks}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {links.length === 0 ? (
          <Text style={styles.emptyText}>No links yet. Create your first link!</Text>
        ) : (
          links.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              <Text style={styles.linkUrl}>{link.url}</Text>
              {link.resource && (
                <Text style={styles.linkResource}>Resource: {link.resource}</Text>
              )}
              <Text style={styles.linkMeta}>
                Views: {link.views}
                {link.viewed_at && ` | Last viewed: ${formatDate(link.viewed_at)}`}
              </Text>
              <Text style={styles.linkMeta}>
                Created: {formatDate(link.created_at)}
              </Text>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => handleMarkViewed(link.id)}
                >
                  <Text style={styles.actionButtonText}>Mark Viewed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(link.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  refreshButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
  },
  linkCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  linkUrl: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  linkResource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  linkMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  linkActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});
