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
  Modal,
} from 'react-native';
import { apiClient } from '../api/client';
import { Link } from '../types';

/**
 * VARIANT 2: Card grid
 * 
 * Features:
 * - Links displayed as cards
 * - Modal window for adding
 * - Resource filtering
 * - More visually appealing design
 */
export default function Variant2_CardGrid() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newResource, setNewResource] = useState('');
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
      await apiClient.createLink({
        url: newUrl.trim(),
        resource: newResource.trim() || undefined,
      });
      setNewUrl('');
      setNewResource('');
      setShowModal(false);
      await loadLinks();
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
      Alert.alert('Error', `Failed to get random link: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (id: string) => {
    try {
      await apiClient.markViewed(id);
      await loadLinks();
    } catch (error) {
      Alert.alert('Error', `Failed to mark as viewed: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteLink(id);
            await loadLinks();
          } catch (error) {
            Alert.alert('Error', `Failed to delete: ${error}`);
          }
        },
      },
    ]);
  };

  const filteredLinks = filterResource
    ? links.filter((link) => link.resource === filterResource)
    : links;

  const resources = Array.from(new Set(links.map((l) => l.resource).filter(Boolean)));

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.headerButtonText}>+ Add Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGetRandom}
          disabled={loading}
        >
          <Text style={styles.headerButtonText}>🎲 Random</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      {resources.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !filterResource && styles.filterChipActive,
              ]}
              onPress={() => setFilterResource('')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !filterResource && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {resources.map((resource) => (
              <TouchableOpacity
                key={resource}
                style={[
                  styles.filterChip,
                  filterResource === resource && styles.filterChipActive,
                ]}
                onPress={() => setFilterResource(resource || '')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterResource === resource && styles.filterChipTextActive,
                  ]}
                >
                  {resource}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Cards Grid */}
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        {loading && <ActivityIndicator style={styles.loader} />}
        {filteredLinks.length === 0 && !loading && (
          <Text style={styles.emptyText}>No links found</Text>
        )}
        {filteredLinks.map((link) => (
          <View key={link.id} style={styles.card}>
            <View style={styles.cardHeader}>
              {link.resource && (
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{link.resource}</Text>
                </View>
              )}
              <View style={styles.cardViews}>
                <Text style={styles.cardViewsText}>👁 {link.views}</Text>
              </View>
            </View>
            <Text style={styles.cardUrl} numberOfLines={2}>
              {link.url}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.cardAction}
                onPress={() => handleMarkViewed(link.id)}
              >
                <Text style={styles.cardActionText}>✓ Viewed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardAction, styles.cardActionDelete]}
                onPress={() => handleDelete(link.id)}
              >
                <Text style={styles.cardActionText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Link Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="URL"
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Resource (optional)"
              value={newResource}
              onChangeText={setNewResource}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleCreateLink}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
  },
  filterChipText: {
    color: '#666',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  loader: {
    width: '100%',
    margin: 20,
  },
  emptyText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardTagText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
  cardViews: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardViewsText: {
    fontSize: 10,
    color: '#666',
  },
  cardUrl: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    minHeight: 40,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardAction: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardActionDelete: {
    backgroundColor: '#f44336',
    flex: 0,
    paddingHorizontal: 12,
  },
  cardActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSave: {
    backgroundColor: '#6200ee',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
