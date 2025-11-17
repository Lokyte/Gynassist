import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Healthcare-specific caching strategies with performance optimization
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  priority: 'low' | 'normal' | 'high';
  type: 'critical' | 'normal' | 'non-critical';
}

interface CacheConfig {
  maxAge: number; // milliseconds
  priority: 'low' | 'normal' | 'high';
  type: 'critical' | 'normal' | 'non-critical';
}

class HealthcareCacheManager {
  private readonly memoryCache = new Map<string, CacheEntry<any>>();
  private readonly maxMemoryCacheSize = 50;
  private readonly storagePrefix = 'gynaid_cache_';
  private cleanupInterval: any = null;

  // Cache configurations for different healthcare data types
  private readonly cacheConfigs: Record<string, CacheConfig> = {
    // Critical healthcare data - cache for longer periods
    userProfile: { maxAge: 24 * 60 * 60 * 1000, priority: 'high', type: 'critical' }, // 24h
    medicalHistory: { maxAge: 12 * 60 * 60 * 1000, priority: 'high', type: 'critical' }, // 12h
    emergencyContacts: { maxAge: 6 * 60 * 60 * 1000, priority: 'high', type: 'critical' }, // 6h
    
    // Normal healthcare data
    appointments: { maxAge: 2 * 60 * 60 * 1000, priority: 'normal', type: 'normal' }, // 2h
    providers: { maxAge: 4 * 60 * 60 * 1000, priority: 'normal', type: 'normal' }, // 4h
    healthTips: { maxAge: 6 * 60 * 60 * 1000, priority: 'normal', type: 'normal' }, // 6h
    
    // Non-critical data - cache for shorter periods
    notifications: { maxAge: 30 * 60 * 1000, priority: 'low', type: 'non-critical' }, // 30min
    chatHistory: { maxAge: 2 * 60 * 60 * 1000, priority: 'low', type: 'non-critical' }, // 2h
    uiPreferences: { maxAge: 60 * 60 * 1000, priority: 'low', type: 'non-critical' }, // 1h
  };

  constructor() {
    this.startCleanupService();
    this.initializeCache();
  }

  /**
   * Initialize cache system with performance optimizations
   */
  private async initializeCache() {
    console.log('🏥 Healthcare Cache: Initializing advanced caching system');
    
    // Pre-load critical healthcare data from storage
    await this.warmupCriticalCache();
    
    // Set up memory monitoring integration
    this.setupMemoryMonitoring();
  }

  /**
   * Set up memory monitoring integration
   */
  private setupMemoryMonitoring() {
    // This would integrate with the MemoryMonitor.ts we created earlier
    console.log('🔗 Healthcare Cache: Memory monitoring integration ready');
  }

  /**
   * Warm up critical cache with essential healthcare data
   */
  private async warmupCriticalCache() {
    const criticalKeys = ['userProfile', 'medicalHistory', 'emergencyContacts'];
    
    for (const key of criticalKeys) {
      try {
        const data = await this.getFromStorage(key);
        if (data) {
          this.memoryCache.set(key, {
            ...data,
            priority: 'high',
            type: 'critical'
          });
          console.log(`✅ Healthcare Cache: Warmed up critical cache for ${key}`);
        }
      } catch (error) {
        console.warn(`⚠️ Healthcare Cache: Failed to warmup ${key}:`, error);
      }
    }
  }

  /**
   * Set up automatic cleanup service
   */
  private startCleanupService() {
    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Stop cleanup service
   */
  stopCleanupService() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Store data with healthcare-specific caching strategy
   */
  async set<T>(key: string, data: T, customConfig?: Partial<CacheConfig>): Promise<void> {
    const config = { ...this.cacheConfigs[key], ...customConfig };
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + config.maxAge,
      priority: config.priority,
      type: config.type
    };

    // Store in memory cache (fast access)
    this.memoryCache.set(key, entry);
    
    // Manage memory cache size - remove lowest priority entries first
    if (this.memoryCache.size > this.maxMemoryCacheSize) {
      this.evictFromMemoryCache();
    }
    
    // Store in persistent storage
    await this.setToStorage(key, entry);
    
    console.log(`💾 Healthcare Cache: Stored ${key} (${config.type}, ${config.priority})`);
  }

  /**
   * Get cached data with healthcare optimization
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first (fastest access)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      console.log(`⚡ Healthcare Cache: Memory cache hit for ${key}`);
      return memoryEntry.data;
    }
    
    // Try persistent storage
    const storageEntry = await this.getFromStorage(key);
    if (storageEntry && !this.isExpired(storageEntry)) {
      console.log(`💾 Healthcare Cache: Storage cache hit for ${key}`);
      
      // Promote to memory cache
      this.memoryCache.set(key, storageEntry);
      
      return storageEntry.data;
    }
    
    // Clean up expired entries if any
    if (memoryEntry || storageEntry) {
      await this.remove(key);
    }
    
    console.log(`❌ Healthcare Cache: Cache miss for ${key}`);
    return null;
  }

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await AsyncStorage.removeItem(this.storagePrefix + key);
    console.log(`🗑️ Healthcare Cache: Removed ${key}`);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(this.storagePrefix));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('🧹 Healthcare Cache: All cache cleared');
  }

  /**
   * Get cache statistics for performance monitoring
   */
  getCacheStats(): {
    memorySize: number;
    storageKeys: number;
    cacheHits: number;
    cacheMisses: number;
  } {
    // This would track actual metrics in a real implementation
    return {
      memorySize: this.memoryCache.size,
      storageKeys: 0, // Would implement storage key counting
      cacheHits: 0, // Would implement hit tracking
      cacheMisses: 0, // Would implement miss tracking
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict entries from memory cache based on priority
   */
  private evictFromMemoryCache() {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by priority and type (low priority non-critical first)
    entries.sort(([, a], [, b]) => {
      const priorityOrder = { low: 0, normal: 1, high: 2 };
      const typeOrder = { 'non-critical': 0, normal: 1, critical: 2 };
      
      const aScore = priorityOrder[a.priority] + typeOrder[a.type];
      const bScore = priorityOrder[b.priority] + typeOrder[b.type];
      
      return aScore - bScore; // Lower score evicted first
    });
    
    // Remove lowest priority entries
    const toRemove = Math.max(1, Math.floor(this.maxMemoryCacheSize * 0.2));
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [key] = entries[i];
      this.memoryCache.delete(key);
      console.log(`📤 Healthcare Cache: Evicted ${key} from memory`);
    }
  }

  /**
   * Perform cleanup of expired entries
   */
  private async performCleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Check memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired entries
    for (const key of expiredKeys) {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(this.storagePrefix + key);
    }
    
    console.log(`🧹 Healthcare Cache: Cleaned up ${expiredKeys.length} expired entries`);
  }

  /**
   * Store to persistent storage
   */
  private async setToStorage(key: string, entry: CacheEntry<any>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storagePrefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`⚠️ Healthcare Cache: Failed to store ${key} in storage:`, error);
    }
  }

  /**
   * Get from persistent storage
   */
  private async getFromStorage(key: string): Promise<CacheEntry<any> | null> {
    try {
      const stored = await AsyncStorage.getItem(this.storagePrefix + key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn(`⚠️ Healthcare Cache: Failed to get ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopCleanupService();
    this.memoryCache.clear();
    console.log('🧹 Healthcare Cache: Cleanup completed');
  }
}

// Export singleton instance for healthcare app
export default new HealthcareCacheManager();