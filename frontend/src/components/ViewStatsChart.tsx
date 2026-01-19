import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { apiClient } from '../api/client';
import { ViewStats } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH >= 768;

interface ViewStatsChartProps {
  days?: number;
}

/**
 * View statistics chart component in GitHub style
 * Displays view statistics by day as squares
 */
export default function ViewStatsChart({ days = 365 }: ViewStatsChartProps) {
  const [stats, setStats] = useState<ViewStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ViewStats | null>(null);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getViewStats(days);
      
      // Make sure we got all days
      if (data.length !== days) {
        console.warn(`Expected ${days} days, got ${data.length}`);
      }
      
      setStats(data);
      
      // Calculate total views
      const total = data.reduce((sum, stat) => sum + stat.count, 0);
      setTotalViews(total);
      
      // Debug information
      const daysWithViews = data.filter(d => d.count > 0).length;
      const daysWithoutViews = data.filter(d => d.count === 0).length;
      console.log(`Stats loaded: ${daysWithViews} days with views, ${daysWithoutViews} days without views`);
    } catch (error) {
      console.error('Failed to load view stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForLevel = (level: number): string => {
    switch (level) {
      case 0:
        return '#21262d'; // No views - lighter so it's visible
      case 1:
        return '#0e4429'; // Low level
      case 2:
        return '#006d32'; // Medium level
      case 3:
        return '#26a641'; // High level
      case 4:
        return '#39d353'; // Very high level
      default:
        return '#21262d';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Group by weeks for display
  // Make sure all days are displayed, even if there are fewer than 7 in the last week
  const weeks: ViewStats[][] = [];
  const weekMonths: (string | null)[] = []; // Month for each week
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < stats.length; i += 7) {
    const week = stats.slice(i, i + 7);
    // Fill week to 7 days if needed (for proper display)
    while (week.length < 7 && i + week.length < stats.length) {
      // This shouldn't happen, but just in case
      break;
    }
    weeks.push(week);
    
    // Determine month for this week (take first day of week)
    if (week.length > 0) {
      const firstDay = new Date(week[0].date);
      const weekIndex = weeks.length - 1;
      
      // Check if new month starts in this week
      // Show month if this is first week of month or if previous week was different month
      let showMonth: string | null = null;
      if (weekIndex === 0) {
        // First week - always show month
        showMonth = monthNames[firstDay.getMonth()];
      } else {
        // Check previous week
        const prevWeek = weeks[weekIndex - 1];
        if (prevWeek && prevWeek.length > 0) {
          const prevFirstDay = new Date(prevWeek[0].date);
          if (prevFirstDay.getMonth() !== firstDay.getMonth()) {
            showMonth = monthNames[firstDay.getMonth()];
          }
        }
      }
      weekMonths.push(showMonth);
    } else {
      weekMonths.push(null);
    }
  }
  
  // Make sure we have all days
  const totalDays = weeks.reduce((sum, week) => sum + week.length, 0);
  if (totalDays !== stats.length) {
    console.warn(`Days mismatch: expected ${stats.length}, got ${totalDays}`);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>View Statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#58a6ff" />
        </View>
      </View>
    );
  }

  // If no data, show empty grid
  if (stats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>View Statistics</Text>
        </View>
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyMessageText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {totalViews} {totalViews === 1 ? 'view' : 'views'} in the last {days} days
          </Text>
          {selectedDay && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {selectedDay.count} {selectedDay.count === 1 ? 'view' : 'views'} on {formatDate(selectedDay.date)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.chartScrollContainer}
        contentContainerStyle={styles.chartScrollContent}
      >
        <View style={styles.chartContainer}>
          {/* Months - displayed above chart */}
          <View style={styles.monthsContainer}>
            {weeks.map((week, weekIndex) => {
              const month = weekMonths[weekIndex];
              return (
                <View key={`month-${weekIndex}`} style={styles.monthLabel}>
                  {month && <Text style={styles.monthText}>{month}</Text>}
                </View>
              );
            })}
          </View>
          
          {/* Chart with squares */}
          <View style={styles.weeksContainer}>
            {weeks.length > 0 ? (
              weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                  {week.map((day, dayIndex) => {
                    const isSelected = selectedDay?.date === day.date;
                    const hasViews = day.count > 0;
                    return (
                      <TouchableOpacity
                        key={`${weekIndex}-${dayIndex}-${day.date}`}
                        style={[
                          styles.day,
                          {
                            backgroundColor: getColorForLevel(day.level),
                            borderColor: isSelected ? '#58a6ff' : (hasViews ? 'transparent' : '#30363d'),
                            borderWidth: isSelected ? 2 : (hasViews ? 0 : 1),
                          },
                        ]}
                        onPress={() => setSelectedDay(day)}
                        onLongPress={() => setSelectedDay(null)}
                      />
                    );
                  })}
                </View>
              ))
            ) : (
              <Text style={styles.emptyMessageText}>No data to display</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Legend - always visible */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={styles.legendColors}>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[
                styles.legendColor,
                { backgroundColor: getColorForLevel(level) },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: IS_DESKTOP ? 8 : 12,
    padding: IS_DESKTOP ? 16 : 20,
    marginBottom: IS_DESKTOP ? 12 : 16,
  },
  header: {
    marginBottom: IS_DESKTOP ? 12 : 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: IS_DESKTOP ? 13 : 15,
    fontWeight: '600',
    color: '#f0f6fc',
  },
  tooltip: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: IS_DESKTOP ? 6 : 8,
    paddingHorizontal: IS_DESKTOP ? 8 : 12,
    paddingVertical: IS_DESKTOP ? 4 : 6,
  },
  tooltipText: {
    fontSize: IS_DESKTOP ? 11 : 12,
    color: '#8b949e',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyMessage: {
    padding: 20,
    alignItems: 'center',
  },
  emptyMessageText: {
    fontSize: IS_DESKTOP ? 12 : 14,
    color: '#8b949e',
  },
  chartScrollContainer: {
    maxHeight: IS_DESKTOP ? 180 : 220,
    marginBottom: IS_DESKTOP ? 12 : 16,
  },
  chartScrollContent: {
    paddingRight: IS_DESKTOP ? 16 : 20,
    paddingBottom: 4,
  },
  chartContainer: {
    alignItems: 'flex-start',
  },
  monthsContainer: {
    flexDirection: 'row',
    gap: IS_DESKTOP ? 3 : 4,
    marginBottom: IS_DESKTOP ? 6 : 8,
    height: IS_DESKTOP ? 16 : 18,
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  monthLabel: {
    width: IS_DESKTOP ? 11 : 12,
    height: IS_DESKTOP ? 16 : 18,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  monthText: {
    fontSize: IS_DESKTOP ? 10 : 11,
    color: '#8b949e',
    fontWeight: '400',
    lineHeight: IS_DESKTOP ? 14 : 16,
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: IS_DESKTOP ? 3 : 4,
    marginBottom: IS_DESKTOP ? 12 : 16,
  },
  week: {
    flexDirection: 'column',
    gap: IS_DESKTOP ? 3 : 4,
  },
  day: {
    width: IS_DESKTOP ? 11 : 12,
    height: IS_DESKTOP ? 11 : 12,
    borderRadius: IS_DESKTOP ? 2 : 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: IS_DESKTOP ? 4 : 6,
  },
  legendText: {
    fontSize: IS_DESKTOP ? 10 : 11,
    color: '#8b949e',
  },
  legendColors: {
    flexDirection: 'row',
    gap: IS_DESKTOP ? 2 : 3,
  },
  legendColor: {
    width: IS_DESKTOP ? 10 : 11,
    height: IS_DESKTOP ? 10 : 11,
    borderRadius: IS_DESKTOP ? 2 : 3,
  },
});
