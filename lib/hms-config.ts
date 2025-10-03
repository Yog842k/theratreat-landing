// 100ms Configuration Utility
// This file helps manage 100ms API keys and configuration

/**
 * 100ms Configuration Object
 * Centralizes all 100ms-related environment variables
 */
export const hmsConfig = {
  // Basic API Configuration
  accessKey: process.env.HMS_ACCESS_KEY,
  secret: process.env.HMS_SECRET,
  templateId: process.env.HMS_TEMPLATE_ID,
  subdomain: process.env.HMS_SUBDOMAIN,
  
  // Optional Configuration
  region: process.env.HMS_REGION || 'in',
  roomCodePrefix: process.env.HMS_ROOM_CODE_PREFIX || 'therabook',
  
  // Advanced Configuration (Server-side only)
  managementToken: process.env.HMS_MANAGEMENT_TOKEN,
  
  // Helper URLs
  dashboardUrl: 'https://dashboard.100ms.live/',
  docsUrl: 'https://docs.100ms.live/',
  
  // Validation
  isConfigured: function() {
    return !!(this.accessKey && this.secret && this.templateId);
  },
  
  // Check if advanced features are available
  hasManagementToken: function() {
    return !!this.managementToken;
  },
  
  // Generate room URL for given room code
  getRoomUrl: function(roomCode: string) {
    if (!this.subdomain) {
      console.warn('HMS_SUBDOMAIN not configured');
      return null;
    }
    return `https://${this.subdomain}.app.100ms.live/meeting/${roomCode}`;
  }
};

/**
 * Validate 100ms Configuration
 * Call this to check if all required environment variables are set
 */
export function validateHMSConfig() {
  const warnings = [];
  const errors = [];
  
  // Check required variables
  if (!hmsConfig.accessKey) {
    errors.push('HMS_ACCESS_KEY is required');
  }
  
  if (!hmsConfig.secret) {
    errors.push('HMS_SECRET is required');
  }
  
  if (!hmsConfig.templateId) {
    errors.push('HMS_TEMPLATE_ID is required');
  }
  
  if (!hmsConfig.subdomain) {
    warnings.push('HMS_SUBDOMAIN is recommended for better URLs');
  }
  
  if (!hmsConfig.managementToken) {
    warnings.push('HMS_MANAGEMENT_TOKEN is required for server-side room creation');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    configured: hmsConfig.isConfigured()
  };
}

/**
 * Get 100ms Room Configuration
 * Returns configuration object for HMSPrebuilt component
 */
export function getHMSRoomConfig(options: {
  roomCode: string;
  userName: string;
  userId?: string;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
}) {
  return {
    roomCode: options.roomCode,
    options: {
      userName: options.userName,
      userId: options.userId || `user_${Date.now()}`,
      // Add any default settings
      settings: {
        isAudioMuted: options.isAudioMuted || false,
        isVideoMuted: options.isVideoMuted || false,
      }
    }
  };
}

/**
 * Development Helper
 * Use this in development to check your configuration
 */
export function debugHMSConfig() {
  console.group('🎥 100ms Configuration Debug');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Is Configured:', hmsConfig.isConfigured());
  console.log('Has Management Token:', hmsConfig.hasManagementToken());
  
  const validation = validateHMSConfig();
  
  if (validation.errors.length > 0) {
    console.error('❌ Configuration Errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (validation.isValid) {
    console.log('✅ Basic configuration is valid!');
  }
  
  console.groupEnd();
  
  return validation;
}

// Export for easy access
export default hmsConfig;
