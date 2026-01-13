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
  Dimensions,
  Platform,
} from 'react-native';
import { apiClient } from '../api/client';
import { Link } from '../types';
import ViewStatsChart from '../components/ViewStatsChart';

// Функция для определения размера экрана
const getScreenDimensions = () => Dimensions.get('window');

// Начальные размеры для создания стилей
const initialDimensions = getScreenDimensions();
const INITIAL_IS_DESKTOP = initialDimensions.width >= 768;

/**
 * Современный интерфейс в стиле Cursor/GitHub
 * - Темная тема
 * - Минималистичный дизайн
 * - Чистая типографика
 * - Профессиональный вид
 */
export default function ModernScreen() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newResource, setNewResource] = useState('');
  const [randomLink, setRandomLink] = useState<Link | null>(null);
  const [filterResource, setFilterResource] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dimensions, setDimensions] = useState(getScreenDimensions());

  // Отслеживаем изменение размера экрана
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const IS_DESKTOP = dimensions.width >= 768;
  const IS_MOBILE = dimensions.width < 768;

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
      setShowAddForm(false);
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
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const resources = Array.from(new Set(links.map((l) => l.resource).filter(Boolean)));
  const filteredLinks = searchQuery
    ? links.filter(
        (l) =>
          l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.resource?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : links;

  const stats = {
    total: links.length,
    viewed: links.filter((l) => l.views > 0).length,
    totalViews: links.reduce((sum, l) => sum + l.views, 0),
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#58a6ff" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>LinkKeeper</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
            contentContainerStyle={styles.statsRow}
          >
            <Text style={styles.statText}>{stats.total} links</Text>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>{stats.viewed} viewed</Text>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>{stats.totalViews} views</Text>
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Enter URL..."
            placeholderTextColor="#6e7681"
            value={newUrl}
            onChangeText={setNewUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TextInput
            style={styles.input}
            placeholder="Resource (optional)"
            placeholderTextColor="#6e7681"
            value={newResource}
            onChangeText={setNewResource}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setNewUrl('');
                setNewResource('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateLink}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Add Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search and Filters */}
      <View style={[styles.toolbar, IS_DESKTOP && styles.toolbarDesktop]}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search links..."
            placeholderTextColor="#6e7681"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.randomButton}
          onPress={handleGetRandom}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.randomButtonText}>🎲 Random</Text>
        </TouchableOpacity>
      </View>

      {/* Resource Filters */}
      {resources.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filterResource && styles.filterChipActive,
            ]}
            onPress={() => setFilterResource('')}
            activeOpacity={0.7}
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
              activeOpacity={0.7}
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
      )}

      {/* View Statistics Chart */}
      <View style={styles.chartWrapper}>
        <ViewStatsChart days={365} />
      </View>

      {/* Random Link Card */}
      {randomLink && (
        <View style={styles.randomCard}>
          <View style={styles.randomCardHeader}>
            <Text style={styles.randomCardTitle}>Random Link</Text>
            <TouchableOpacity
              onPress={() => setRandomLink(null)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.randomCardUrl}>{randomLink.url}</Text>
          {randomLink.resource && (
            <View style={styles.randomCardTag}>
              <Text style={styles.randomCardTagText}>{randomLink.resource}</Text>
            </View>
          )}
          <View style={styles.randomCardMeta}>
            <Text style={styles.randomCardMetaText}>
              👁 {randomLink.views} views
            </Text>
            <Text style={styles.randomCardMetaText}>
              {formatDate(randomLink.created_at)}
            </Text>
          </View>
          <View style={styles.randomCardActions}>
            <TouchableOpacity
              style={styles.checkboxButton}
              onPress={() => handleMarkViewed(randomLink.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, randomLink.views > 0 && styles.checkboxChecked]}>
                {randomLink.views > 0 && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mark Viewed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => handleDelete(randomLink.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Links List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredLinks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔗</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No links found' : 'No links yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? 'Try a different search query'
                : 'Add your first link to get started'}
            </Text>
          </View>
        ) : (
          filteredLinks.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkCardHeader}>
                <Text style={styles.linkUrl} numberOfLines={2}>
                  {link.url}
                </Text>
                {link.views > 0 && (
                  <View style={styles.viewedBadge}>
                    <Text style={styles.viewedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              {link.resource && (
                <View style={styles.linkTag}>
                  <Text style={styles.linkTagText}>{link.resource}</Text>
                </View>
              )}
              <View style={styles.linkMeta}>
                <Text style={styles.linkMetaText}>
                  👁 {link.views} views
                </Text>
                <Text style={styles.linkMetaDivider}>•</Text>
                <Text style={styles.linkMetaText}>
                  {formatDate(link.created_at)}
                </Text>
                {link.viewed_at && (
                  <>
                    <Text style={styles.linkMetaDivider}>•</Text>
                    <Text style={styles.linkMetaText}>
                      Viewed {formatDate(link.viewed_at)}
                    </Text>
                  </>
                )}
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.checkboxButton}
                  onPress={() => handleMarkViewed(link.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, link.views > 0 && styles.checkboxChecked]}>
                    {link.views > 0 && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Mark Viewed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteIconButton}
                  onPress={() => handleDelete(link.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Адаптивные размеры (используем начальное значение для создания стилей)
const getResponsiveStyles = (isDesktop: boolean) => ({
  // Header
  headerPadding: isDesktop ? 12 : 20,
  headerPaddingTop: isDesktop ? 12 : 20,
  headerTitleSize: isDesktop ? 18 : 24,
  statTextSize: isDesktop ? 11 : 13,
  
  // Buttons
  buttonHeight: isDesktop ? 32 : 48,
  buttonPaddingH: isDesktop ? 12 : 24,
  buttonPaddingV: isDesktop ? 8 : 14,
  buttonTextSize: isDesktop ? 13 : 16,
  addButtonSize: isDesktop ? 32 : 48,
  addButtonTextSize: isDesktop ? 18 : 24,
  
  // Forms
  inputHeight: isDesktop ? 36 : 52,
  inputPadding: isDesktop ? 10 : 16,
  inputFontSize: isDesktop ? 14 : 16,
  formPadding: isDesktop ? 12 : 20,
  
  // Toolbar
  toolbarPadding: isDesktop ? 12 : 16,
  toolbarGap: isDesktop ? 8 : 12,
  searchHeight: isDesktop ? 36 : 52,
  searchPadding: isDesktop ? 10 : 14,
  searchFontSize: isDesktop ? 14 : 16,
  
  // Cards
  cardPadding: isDesktop ? 12 : 20,
  cardMargin: isDesktop ? 12 : 16,
  cardFontSize: isDesktop ? 13 : 15,
  cardMetaSize: isDesktop ? 11 : 13,
  
  // Filters
  filterChipHeight: isDesktop ? 28 : 40,
  filterChipPaddingH: isDesktop ? 10 : 16,
  filterChipPaddingV: isDesktop ? 6 : 10,
  filterChipTextSize: isDesktop ? 12 : 14,
});

// Используем начальное значение для создания базовых стилей
const responsive = getResponsiveStyles(INITIAL_IS_DESKTOP);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117', // GitHub dark background
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  header: {
    backgroundColor: '#161b22', // GitHub header background
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    paddingHorizontal: responsive.headerPadding,
    paddingVertical: responsive.headerPadding,
    paddingTop: responsive.headerPaddingTop,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginRight: INITIAL_IS_DESKTOP ? 8 : 12,
  },
  headerTitle: {
    fontSize: responsive.headerTitleSize,
    fontWeight: '600',
    color: '#f0f6fc', // GitHub text primary
    marginBottom: INITIAL_IS_DESKTOP ? 4 : 6,
  },
  statsScroll: {
    maxHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  statText: {
    fontSize: responsive.statTextSize,
    color: '#8b949e', // GitHub text secondary
  },
  statDivider: {
    fontSize: responsive.statTextSize,
    color: '#30363d',
  },
  addButton: {
    width: responsive.addButtonSize,
    height: responsive.addButtonSize,
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 12,
    backgroundColor: '#238636', // GitHub green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#238636',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: INITIAL_IS_DESKTOP ? 0.2 : 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: responsive.addButtonTextSize,
    color: '#fff',
    fontWeight: '300',
  },
  addForm: {
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    padding: responsive.formPadding,
  },
  input: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 10,
    padding: responsive.inputPadding,
    marginBottom: INITIAL_IS_DESKTOP ? 10 : 16,
    fontSize: responsive.inputFontSize,
    color: '#f0f6fc',
    fontFamily: 'monospace',
    minHeight: responsive.inputHeight,
  },
  formActions: {
    flexDirection: 'row',
    gap: responsive.toolbarGap,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: responsive.buttonPaddingH,
    paddingVertical: responsive.buttonPaddingV,
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 10,
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: responsive.buttonHeight,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#f0f6fc',
    fontSize: responsive.buttonTextSize,
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: responsive.buttonPaddingH,
    paddingVertical: responsive.buttonPaddingV,
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 10,
    backgroundColor: '#238636',
    minHeight: responsive.buttonHeight,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: responsive.buttonTextSize,
    fontWeight: '500',
  },
  toolbar: {
    flexDirection: INITIAL_IS_DESKTOP ? 'row' : 'column',
    padding: responsive.toolbarPadding,
    gap: responsive.toolbarGap,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    alignItems: INITIAL_IS_DESKTOP ? 'center' : 'stretch',
  },
  toolbarDesktop: {
    flexDirection: 'row',
  },
  searchContainer: {
    flex: INITIAL_IS_DESKTOP ? 1 : undefined,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 10,
    paddingHorizontal: INITIAL_IS_DESKTOP ? 10 : 16,
    minHeight: responsive.searchHeight,
  },
  searchIcon: {
    fontSize: INITIAL_IS_DESKTOP ? 14 : 18,
    marginRight: INITIAL_IS_DESKTOP ? 8 : 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: responsive.searchPadding,
    fontSize: responsive.searchFontSize,
    color: '#f0f6fc',
  },
  randomButton: {
    paddingHorizontal: INITIAL_IS_DESKTOP ? 12 : 20,
    paddingVertical: responsive.buttonPaddingV,
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 10,
    backgroundColor: '#1f6feb', // GitHub blue
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: responsive.buttonHeight,
    ...(INITIAL_IS_DESKTOP && { minWidth: 100 }),
  },
  randomButtonText: {
    color: '#fff',
    fontSize: responsive.buttonTextSize,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  filtersContent: {
    paddingHorizontal: INITIAL_IS_DESKTOP ? 12 : 16,
    paddingVertical: INITIAL_IS_DESKTOP ? 10 : 14,
    gap: INITIAL_IS_DESKTOP ? 6 : 10,
  },
  filterChip: {
    paddingHorizontal: responsive.filterChipPaddingH,
    paddingVertical: responsive.filterChipPaddingV,
    borderRadius: INITIAL_IS_DESKTOP ? 12 : 16,
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: responsive.filterChipHeight,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#1f6feb',
    borderColor: '#1f6feb',
  },
  filterChipText: {
    fontSize: responsive.filterChipTextSize,
    color: '#8b949e',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  randomCard: {
    margin: responsive.cardMargin,
    marginBottom: 0,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: INITIAL_IS_DESKTOP ? 8 : 12,
    padding: responsive.cardPadding,
  },
  randomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: INITIAL_IS_DESKTOP ? 10 : 16,
  },
  randomCardTitle: {
    fontSize: INITIAL_IS_DESKTOP ? 13 : 16,
    fontWeight: '600',
    color: '#58a6ff', // GitHub link color
  },
  closeButton: {
    width: INITIAL_IS_DESKTOP ? 28 : 40,
    height: INITIAL_IS_DESKTOP ? 28 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 8,
  },
  closeButtonText: {
    fontSize: INITIAL_IS_DESKTOP ? 18 : 24,
    color: '#8b949e',
    fontWeight: '300',
  },
  randomCardUrl: {
    fontSize: responsive.cardFontSize,
    color: '#58a6ff',
    marginBottom: INITIAL_IS_DESKTOP ? 8 : 12,
    fontFamily: 'monospace',
    lineHeight: INITIAL_IS_DESKTOP ? 18 : 22,
  },
  randomCardTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f6feb',
    paddingHorizontal: INITIAL_IS_DESKTOP ? 8 : 12,
    paddingVertical: INITIAL_IS_DESKTOP ? 4 : 6,
    borderRadius: INITIAL_IS_DESKTOP ? 4 : 6,
    marginBottom: INITIAL_IS_DESKTOP ? 8 : 12,
  },
  randomCardTagText: {
    fontSize: INITIAL_IS_DESKTOP ? 10 : 12,
    color: '#fff',
    fontWeight: '600',
  },
  randomCardMeta: {
    flexDirection: 'row',
    gap: INITIAL_IS_DESKTOP ? 8 : 10,
    marginBottom: INITIAL_IS_DESKTOP ? 10 : 16,
    flexWrap: 'wrap',
  },
  randomCardMetaText: {
    fontSize: responsive.cardMetaSize,
    color: '#8b949e',
  },
  randomCardActions: {
    flexDirection: 'row',
    gap: responsive.toolbarGap,
    alignItems: 'center',
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: INITIAL_IS_DESKTOP ? 8 : 10,
    flex: 1,
  },
  checkbox: {
    width: INITIAL_IS_DESKTOP ? 18 : 20,
    height: INITIAL_IS_DESKTOP ? 18 : 20,
    borderRadius: INITIAL_IS_DESKTOP ? 4 : 5,
    borderWidth: 2,
    borderColor: '#30363d',
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#238636',
    borderColor: '#238636',
  },
  checkboxCheckmark: {
    color: '#fff',
    fontSize: INITIAL_IS_DESKTOP ? 12 : 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#f0f6fc',
    fontSize: responsive.buttonTextSize,
    fontWeight: '500',
  },
  deleteIconButton: {
    width: INITIAL_IS_DESKTOP ? 36 : 40,
    height: INITIAL_IS_DESKTOP ? 36 : 40,
    borderRadius: INITIAL_IS_DESKTOP ? 6 : 8,
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#da3633',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: INITIAL_IS_DESKTOP ? 16 : 18,
  },
  list: {
    flex: 1,
  },
  chartWrapper: {
    paddingHorizontal: INITIAL_IS_DESKTOP ? 12 : 16,
    paddingTop: INITIAL_IS_DESKTOP ? 0 : 0,
    ...(INITIAL_IS_DESKTOP && { maxWidth: 1200, alignSelf: 'center', width: '100%' }),
  },
  listContent: {
    padding: INITIAL_IS_DESKTOP ? 12 : 16,
    paddingBottom: INITIAL_IS_DESKTOP ? 16 : 24,
    ...(INITIAL_IS_DESKTOP && { maxWidth: 1200, alignSelf: 'center', width: '100%' }),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: INITIAL_IS_DESKTOP ? 60 : 80,
    paddingHorizontal: INITIAL_IS_DESKTOP ? 24 : 32,
  },
  emptyStateIcon: {
    fontSize: INITIAL_IS_DESKTOP ? 48 : 64,
    marginBottom: INITIAL_IS_DESKTOP ? 16 : 20,
  },
  emptyStateText: {
    fontSize: INITIAL_IS_DESKTOP ? 16 : 20,
    fontWeight: '600',
    color: '#f0f6fc',
    marginBottom: INITIAL_IS_DESKTOP ? 8 : 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: INITIAL_IS_DESKTOP ? 13 : 16,
    color: '#8b949e',
    textAlign: 'center',
  },
  linkCard: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: INITIAL_IS_DESKTOP ? 8 : 12,
    padding: responsive.cardPadding,
    marginBottom: responsive.cardMargin,
  },
  linkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: INITIAL_IS_DESKTOP ? 8 : 12,
  },
  linkUrl: {
    flex: 1,
    fontSize: responsive.cardFontSize,
    color: '#58a6ff',
    fontFamily: 'monospace',
    marginRight: INITIAL_IS_DESKTOP ? 8 : 12,
    lineHeight: INITIAL_IS_DESKTOP ? 18 : 22,
  },
  viewedBadge: {
    width: INITIAL_IS_DESKTOP ? 20 : 28,
    height: INITIAL_IS_DESKTOP ? 20 : 28,
    borderRadius: INITIAL_IS_DESKTOP ? 10 : 14,
    backgroundColor: '#238636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewedBadgeText: {
    fontSize: INITIAL_IS_DESKTOP ? 11 : 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  linkTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#21262d',
    paddingHorizontal: INITIAL_IS_DESKTOP ? 8 : 12,
    paddingVertical: INITIAL_IS_DESKTOP ? 4 : 6,
    borderRadius: INITIAL_IS_DESKTOP ? 4 : 6,
    marginBottom: INITIAL_IS_DESKTOP ? 8 : 12,
  },
  linkTagText: {
    fontSize: INITIAL_IS_DESKTOP ? 10 : 12,
    color: '#58a6ff',
    fontWeight: '600',
  },
  linkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: INITIAL_IS_DESKTOP ? 10 : 16,
    flexWrap: 'wrap',
    gap: INITIAL_IS_DESKTOP ? 8 : 10,
  },
  linkMetaText: {
    fontSize: responsive.cardMetaSize,
    color: '#8b949e',
  },
  linkMetaDivider: {
    fontSize: responsive.cardMetaSize,
    color: '#30363d',
  },
  linkActions: {
    flexDirection: 'row',
    gap: responsive.toolbarGap,
    alignItems: 'center',
  },
  // Используем те же стили для checkbox и deleteIconButton
});
