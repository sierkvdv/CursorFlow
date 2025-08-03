import React from 'react';
import { Volume2, Eye, Settings, Music, Drum } from 'lucide-react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  effectsEnabled: boolean;
  natureEnabled: boolean;
  melodyEnabled: boolean;
  drumEnabled: boolean;
  ambientEnabled: boolean;
  onToggleAudio: () => void;
  onToggleEffects: () => void;
  onToggleNature: () => void;
  onToggleMelody: () => void;
  onToggleDrum: () => void;
  onToggleAmbient: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  audioEnabled,
  effectsEnabled,
  // natureEnabled,
  melodyEnabled,
  drumEnabled,
  // ambientEnabled,
  onToggleAudio,
  onToggleEffects,
  // onToggleNature,
  onToggleMelody,
  onToggleDrum
  // onToggleAmbient
}) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10001
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            onClose();
          } catch (error) {
            console.error('Error closing settings from backdrop:', error);
          }
        }}
      />
      
      {/* Settings Menu */}
      <div 
        style={{
          position: 'absolute',
          top: '8rem',
          right: '2rem',
          width: '20rem',
          backgroundColor: '#1f2937',
          border: '2px solid #4b5563',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 10002,
          color: 'white'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Settings</h2>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                onClose();
              } catch (error) {
                console.error('Error closing settings:', error);
              }
            }}
            className="interactive-element"
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Settings Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Audio Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Volume2 size={20} />
              Audio Settings
            </h3>
            
            {/* Main Audio Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}>
              <span style={{ color: 'white' }}>Master Audio</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    onToggleAudio();
                  } catch (error) {
                    console.error('Error toggling audio:', error);
                  }
                }}
                className="interactive-element"
                style={{
                  position: 'relative',
                  width: '3rem',
                  height: '2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audioEnabled ? '#3b82f6' : '#6b7280',
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    left: audioEnabled ? '1.25rem' : '0.25rem',
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }}
                />
              </button>
            </div>

            {/* Audio Sub-settings */}
            {audioEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginLeft: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#4b5563', borderRadius: '0.5rem' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Music size={16} />
                    Melody
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        onToggleMelody();
                      } catch (error) {
                        console.error('Error toggling melody:', error);
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: '2.5rem',
                      height: '1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: melodyEnabled ? '#10b981' : '#6b7280',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.125rem',
                        left: melodyEnabled ? '1rem' : '0.125rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'left 0.2s'
                      }}
                    />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#4b5563', borderRadius: '0.5rem' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Drum size={16} />
                    Rhythm
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        onToggleDrum();
                      } catch (error) {
                        console.error('Error toggling rhythm:', error);
                      }
                    }}
                    style={{
                      position: 'relative',
                      width: '2.5rem',
                      height: '1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: drumEnabled ? '#10b981' : '#6b7280',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.125rem',
                        left: drumEnabled ? '1rem' : '0.125rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'left 0.2s'
                      }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Effects Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} />
              Visual Effects
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}>
              <span style={{ color: 'white' }}>Master Effects</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    onToggleEffects();
                  } catch (error) {
                    console.error('Error toggling effects:', error);
                  }
                }}
                style={{
                  position: 'relative',
                  width: '3rem',
                  height: '2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: effectsEnabled ? '#8b5cf6' : '#6b7280',
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    left: effectsEnabled ? '1.25rem' : '0.25rem',
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(75, 85, 99, 0.5)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p>• Click anywhere to close</p>
              <p>• Settings are saved automatically</p>
              <p>• Audio requires user interaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 