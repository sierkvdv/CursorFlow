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
  glitchEnabled?: boolean;
  // Volume controls
  natureVolume: number;
  melodyVolume: number;
  drumVolume: number;
  glitchVolume: number;
  onToggleAudio: () => void;
  onToggleEffects: () => void;
  onToggleNature: () => void;
  onToggleMelody: () => void;
  onToggleDrum: () => void;
  onToggleGlitch?: () => void;
  onVolumeChange: (type: 'nature' | 'melody' | 'drum' | 'glitch', volume: number) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  audioEnabled,
  effectsEnabled,
  natureEnabled,
  melodyEnabled,
  drumEnabled,
  glitchEnabled = false,
  natureVolume = 0.5,
  melodyVolume = 0.5,
  drumVolume = 0.5,
  glitchVolume = 0.5,
  onToggleAudio,
  onToggleEffects,
  onToggleNature,
  onToggleMelody,
  onToggleDrum,
  onToggleGlitch,
  onVolumeChange
}) => {
  // Helper function to create touch-friendly button props
  const createTouchButtonProps = (onClickHandler: () => void) => ({
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      onClickHandler();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.stopPropagation();
      onClickHandler();
    },
    style: {
      touchAction: 'manipulation' as const,
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      MozUserSelect: 'none' as const,
      msUserSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent' as const,
      WebkitTouchCallout: 'none' as const
    }
  });
  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 99999,
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none'
      }}

    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 100000,
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onClose();
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
          zIndex: 100001,
          color: 'white',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Settings</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                onClose();
              } catch (error) {
                console.error('Error closing settings touch:', error);
              }
            }}
            className="interactive-element"
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
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
                {...createTouchButtonProps(onToggleAudio)}
                className="interactive-element"
                style={{
                  position: 'relative',
                  width: '3rem',
                  height: '2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: audioEnabled ? '#3b82f6' : '#6b7280',
                  transition: 'background-color 0.2s',
                  ...createTouchButtonProps(onToggleAudio).style
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#4b5563', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Music size={16} />
                      Melody
                    </span>
                    <button
                      {...createTouchButtonProps(onToggleMelody)}
                      style={{
                        position: 'relative',
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: melodyEnabled ? '#10b981' : '#6b7280',
                        transition: 'background-color 0.2s',
                        ...createTouchButtonProps(onToggleMelody).style
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
                  {melodyEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem' }}>Vol</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={melodyVolume}
                        onChange={(e) => onVolumeChange('melody', parseFloat(e.target.value))}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          height: '0.5rem',
                          borderRadius: '0.25rem',
                          background: '#374151',
                          outline: 'none',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      />
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem', textAlign: 'right' }}>
                        {Math.round(melodyVolume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#4b5563', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Drum size={16} />
                      Beep
                    </span>
                    <button
                      {...createTouchButtonProps(onToggleDrum)}
                      style={{
                        position: 'relative',
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: drumEnabled ? '#10b981' : '#6b7280',
                        transition: 'background-color 0.2s',
                        ...createTouchButtonProps(onToggleDrum).style
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
                  {drumEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem' }}>Vol</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={drumVolume}
                        onChange={(e) => onVolumeChange('drum', parseFloat(e.target.value))}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          height: '0.5rem',
                          borderRadius: '0.25rem',
                          background: '#374151',
                          outline: 'none',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      />
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem', textAlign: 'right' }}>
                        {Math.round(drumVolume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#4b5563', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🌊</span>
                      Nature
                    </span>
                    <button
                      {...createTouchButtonProps(onToggleNature)}
                      style={{
                        position: 'relative',
                        width: '2.5rem',
                        height: '1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: natureEnabled ? '#10b981' : '#6b7280',
                        transition: 'background-color 0.2s',
                        ...createTouchButtonProps(onToggleNature).style
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.125rem',
                          left: natureEnabled ? '1rem' : '0.125rem',
                          width: '1.25rem',
                          height: '1.25rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.2s'
                        }}
                      />
                    </button>
                  </div>
                  {natureEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem' }}>Vol</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={natureVolume}
                        onChange={(e) => onVolumeChange('nature', parseFloat(e.target.value))}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          height: '0.5rem',
                          borderRadius: '0.25rem',
                          background: '#374151',
                          outline: 'none',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      />
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem', textAlign: 'right' }}>
                        {Math.round(natureVolume * 100)}%
                      </span>
                    </div>
                  )}
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
            
            {/* Glitch Mode Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                  Glitch Mode
                </span>
                <button
                  {...createTouchButtonProps(() => onToggleGlitch?.())}
                  className="interactive-element"
                  style={{
                    position: 'relative',
                    width: '3rem',
                    height: '2rem',
                    borderRadius: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: glitchEnabled ? '#ef4444' : '#6b7280',
                    transition: 'background-color 0.2s',
                    ...createTouchButtonProps(() => onToggleGlitch?.()).style
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      left: glitchEnabled ? '1.25rem' : '0.25rem',
                      width: '1.5rem',
                      height: '1.5rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.2s'
                    }}
                  />
                </button>
              </div>
              {glitchEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem' }}>Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={glitchVolume}
                    onChange={(e) => onVolumeChange('glitch', parseFloat(e.target.value))}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      height: '0.5rem',
                      borderRadius: '0.25rem',
                      background: '#4b5563',
                      outline: 'none',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  />
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem', minWidth: '2rem', textAlign: 'right' }}>
                    {Math.round(glitchVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}>
              <span style={{ color: 'white' }}>Master Effects</span>
              <button
                {...createTouchButtonProps(onToggleEffects)}
                style={{
                  position: 'relative',
                  width: '3rem',
                  height: '2rem',
                  borderRadius: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: effectsEnabled ? '#8b5cf6' : '#6b7280',
                  transition: 'background-color 0.2s',
                  ...createTouchButtonProps(onToggleEffects).style
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