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

/**
 * ВАРИАНТ 1: Классический список
 * 
 * Особенности:
 * - Вертикальный список всех ссылок
 * - Форма добавления сверху
 * - Простой и понятный интерфейс
 * - Все функции на одном экране
 */
export default function Variant1_ClassicList() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newResource, setNewResource] = useState('');

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
      await loadLinks();
    } catch (error) {
      Alert.alert('Error', `Failed to create link: ${error}`);
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
    Alert.alert(
      'Delete Link',
      'Are you sure?',
      [
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
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Create Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Add New Link</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter URL"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Resource (optional)"
          value={newResource}
          onChangeText={setNewResource}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateLink}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>Add Link</Text>
        </TouchableOpacity>
      </View>

      {/* Links List */}
      <ScrollView style={styles.list}>
        {loading && <ActivityIndicator style={styles.loader} />}
        {links.length === 0 && !loading && (
          <Text style={styles.emptyText}>No links yet</Text>
        )}
        {links.map((link) => (
          <View key={link.id} style={styles.linkItem}>
            <Text style={styles.linkUrl} numberOfLines={1}>
              {link.url}
            </Text>
            {link.resource && (
              <Text style={styles.linkResource}>{link.resource}</Text>
            )}
            <View style={styles.linkFooter}>
              <Text style={styles.linkViews}>👁 {link.views}</Text>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleMarkViewed(link.id)}
                >
                  <Text style={styles.actionBtnText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(link.id)}
                >
                  <Text style={styles.actionBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  loader: {
    margin: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
  linkItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  linkUrl: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 4,
  },
  linkResource: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  linkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkViews: {
    fontSize: 12,
    color: '#999',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
