import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import type {
  Profile,
  ParsedData,
  SerialConfig,
  FieldMapping,
  ConnectionStatus,
  ServerMessage,
} from './types';
import { LINE_TERMINATORS, BAUD_RATES, DEFAULT_BASKETBALL_PROFILE } from './types';

type TabType = 'connection' | 'profile' | 'mappings' | 'monitor' | 'data';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function App() {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [serialConfig, setSerialConfig] = useState<SerialConfig>({
    port: '',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
  });

  // Profile state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Data state
  const [rawLines, setRawLines] = useState<{ line: string; timestamp: string }[]>([]);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('connection');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('connected');
      // Request available ports
      sendMessage({ type: 'list_ports' });
    };

    ws.onmessage = (event) => {
      const message: ServerMessage = JSON.parse(event.data);
      console.log('Received:', message);

      switch (message.type) {
        case 'connection_status':
          setConnectionStatus(message.status);
          break;

        case 'available_ports':
          setAvailablePorts(message.ports);
          if (message.ports.length > 0 && !serialConfig.port) {
            setSerialConfig((prev) => ({ ...prev, port: message.ports[0] }));
          }
          break;

        case 'profiles_list':
          setProfiles(message.profiles);
          break;

        case 'profile_loaded':
          setCurrentProfile(message.profile);
          break;

        case 'raw_data':
          setRawLines((prev) => [
            { line: message.line, timestamp: message.timestamp },
            ...prev.slice(0, 99), // Keep last 100 lines
          ]);
          break;

        case 'data_update':
          setParsedData(message.data);
          setLastUpdate(message.data.timestamp);
          break;

        case 'error':
          console.error('Server error:', message.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('disconnected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsStatus('disconnected');
    };

    return () => ws.close();
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const handleConnect = () => {
    sendMessage({ type: 'connect', config: serialConfig });
  };

  const handleDisconnect = () => {
    sendMessage({ type: 'disconnect' });
  };

  const handleRefreshPorts = () => {
    sendMessage({ type: 'list_ports' });
  };

  const handleSelectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    sendMessage({ type: 'set_profile', profile });
  };

  const handleSaveProfile = (profile: Profile) => {
    sendMessage({ type: 'save_profile', profile });
    setEditingProfile(null);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      sendMessage({ type: 'delete_profile', profileId });
    }
  };

  const handleCreateProfile = () => {
    const newProfile: Profile = {
      id: generateId(),
      name: 'New Profile',
      sport: 'generic',
      lineTerminator: '\\r\\n',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingProfile(newProfile);
    setActiveTab('mappings');
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile({ ...profile, fields: [...profile.fields] });
    setActiveTab('mappings');
  };

  // Field mapping handlers
  const handleAddField = () => {
    if (!editingProfile) return;
    const newField: FieldMapping = {
      id: generateId(),
      key: `field${editingProfile.fields.length + 1}`,
      startIndex: 0,
      endIndex: 0,
      description: '',
    };
    setEditingProfile({
      ...editingProfile,
      fields: [...editingProfile.fields, newField],
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldMapping>) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      fields: editingProfile.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleRemoveField = (fieldId: string) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      fields: editingProfile.fields.filter((f) => f.id !== fieldId),
    });
  };

  // Render connection tab
  const renderConnectionTab = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-bold mb-2">Serial Port Configuration</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Port</label>
          <div className="flex gap-1">
            <select
              value={serialConfig.port}
              onChange={(e) => setSerialConfig((prev) => ({ ...prev, port: e.target.value }))}
              disabled={connectionStatus === 'connected'}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              {availablePorts.length === 0 && <option value="">No ports found</option>}
              {availablePorts.map((port) => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
            <button
              onClick={handleRefreshPorts}
              disabled={connectionStatus === 'connected'}
              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              title="Refresh ports"
            >
              ↻
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Baud Rate</label>
          <select
            value={serialConfig.baudRate}
            onChange={(e) =>
              setSerialConfig((prev) => ({ ...prev, baudRate: parseInt(e.target.value) }))
            }
            disabled={connectionStatus === 'connected'}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Data Bits</label>
          <select
            value={serialConfig.dataBits}
            onChange={(e) =>
              setSerialConfig((prev) => ({
                ...prev,
                dataBits: parseInt(e.target.value) as 5 | 6 | 7 | 8,
              }))
            }
            disabled={connectionStatus === 'connected'}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="8">8</option>
            <option value="7">7</option>
            <option value="6">6</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Stop Bits</label>
          <select
            value={serialConfig.stopBits}
            onChange={(e) =>
              setSerialConfig((prev) => ({
                ...prev,
                stopBits: parseInt(e.target.value) as 1 | 2,
              }))
            }
            disabled={connectionStatus === 'connected'}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Parity</label>
          <select
            value={serialConfig.parity}
            onChange={(e) =>
              setSerialConfig((prev) => ({
                ...prev,
                parity: e.target.value as 'none' | 'even' | 'odd',
              }))
            }
            disabled={connectionStatus === 'connected'}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="none">None</option>
            <option value="even">Even</option>
            <option value="odd">Odd</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {connectionStatus !== 'connected' ? (
          <button
            onClick={handleConnect}
            disabled={!serialConfig.port || wsStatus !== 'connected'}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Disconnect
          </button>
        )}
      </div>

      {connectionStatus === 'connected' && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            <span className="font-medium">Connected to:</span> {serialConfig.port} at{' '}
            {serialConfig.baudRate} baud
          </p>
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">Connection error. Check port settings.</p>
        </div>
      )}
    </div>
  );

  // Render profile tab
  const renderProfileTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold">Profiles</h2>
        <button
          onClick={handleCreateProfile}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + New Profile
        </button>
      </div>

      <div className="space-y-2">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`p-2 border rounded ${
              currentProfile?.id === profile.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-semibold">{profile.name}</h3>
                <p className="text-[10px] text-gray-500">
                  {profile.sport} • {profile.fields.length} fields • Terminator:{' '}
                  {profile.lineTerminator}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSelectProfile(profile)}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    currentProfile?.id === profile.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {currentProfile?.id === profile.id ? 'Active' : 'Use'}
                </button>
                <button
                  onClick={() => handleEditProfile(profile)}
                  className="px-2 py-0.5 text-[10px] bg-gray-200 rounded hover:bg-gray-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="px-2 py-0.5 text-[10px] bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}

        {profiles.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            No profiles yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );

  // Render mappings tab (field editor)
  const renderMappingsTab = () => {
    const profile = editingProfile || currentProfile;

    if (!profile) {
      return (
        <div className="text-center py-8">
          <p className="text-xs text-gray-500">Select or create a profile to edit mappings.</p>
          <button
            onClick={handleCreateProfile}
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      );
    }

    const isEditing = editingProfile !== null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold">
            {isEditing ? 'Edit Profile' : 'Field Mappings'}
          </h2>
          {isEditing && (
            <div className="flex gap-1">
              <button
                onClick={() => handleSaveProfile(editingProfile)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProfile(null)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile metadata */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div>
              <label className="block text-xs font-medium mb-1">Profile Name</label>
              <input
                type="text"
                value={editingProfile.name}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, name: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Sport</label>
              <input
                type="text"
                value={editingProfile.sport}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, sport: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Line Terminator</label>
              <select
                value={editingProfile.lineTerminator}
                onChange={(e) =>
                  setEditingProfile({ ...editingProfile, lineTerminator: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                {LINE_TERMINATORS.map((term) => (
                  <option key={term.value} value={term.value}>
                    {term.label}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {editingProfile.lineTerminator === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom terminator (e.g., \x03)"
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, lineTerminator: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        )}

        {/* Sample data visualization */}
        {rawLines.length > 0 && (
          <div className="p-2 bg-gray-900 rounded">
            <p className="text-[10px] text-gray-400 mb-1">Latest raw data (hover for position):</p>
            <div className="font-mono text-xs text-green-400 overflow-x-auto whitespace-nowrap">
              {rawLines[0].line.split('').map((char, idx) => (
                <span
                  key={idx}
                  className="hover:bg-yellow-500 hover:text-black cursor-default"
                  title={`Position: ${idx}`}
                >
                  {char === ' ' ? '·' : char}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Length: {rawLines[0].line.length} characters
            </p>
          </div>
        )}

        {/* Field mappings */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold">Field Mappings</h3>
            {isEditing && (
              <button
                onClick={handleAddField}
                className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add Field
              </button>
            )}
          </div>

          <div className="space-y-1">
            {(isEditing ? editingProfile.fields : profile.fields).map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
              >
                <span className="text-[10px] text-gray-400 w-4">{idx + 1}</span>

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        handleUpdateField(field.id, { key: e.target.value })
                      }
                      placeholder="Key name"
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={field.startIndex}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            startIndex: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
                        title="Start index"
                      />
                      <span className="text-xs text-gray-400">-</span>
                      <input
                        type="number"
                        value={field.endIndex}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            endIndex: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
                        title="End index"
                      />
                    </div>
                    <input
                      type="text"
                      value={field.description || ''}
                      onChange={(e) =>
                        handleUpdateField(field.id, { description: e.target.value })
                      }
                      placeholder="Description"
                      className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveField(field.id)}
                      className="px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs font-medium">{field.key}</span>
                    <span className="text-xs text-gray-500">
                      [{field.startIndex}-{field.endIndex}]
                    </span>
                    <span className="text-xs text-gray-400">{field.description}</span>
                    {parsedData && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded font-mono">
                        {parsedData.fields[field.key] || '-'}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}

            {(isEditing ? editingProfile.fields : profile.fields).length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                No field mappings defined.{' '}
                {isEditing && 'Click "Add Field" to create one.'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render monitor tab (raw data)
  const renderMonitorTab = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold">Raw Data Monitor</h2>
        <button
          onClick={() => setRawLines([])}
          className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

      <div className="h-64 overflow-y-auto bg-gray-900 rounded p-2 font-mono text-xs">
        {rawLines.length === 0 ? (
          <p className="text-gray-500">No data received yet. Connect to a serial port.</p>
        ) : (
          rawLines.map((item, idx) => (
            <div key={idx} className="flex gap-2 hover:bg-gray-800">
              <span className="text-gray-500 text-[10px] shrink-0">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-green-400 break-all">{item.line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render data tab (parsed data)
  const renderDataTab = () => (
    <div className="space-y-4">
      <h2 className="text-sm font-bold">Parsed Data</h2>

      {!currentProfile ? (
        <p className="text-xs text-gray-500">Select a profile to see parsed data.</p>
      ) : !parsedData ? (
        <p className="text-xs text-gray-500">No data received yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(parsedData.fields).map(([key, value]) => (
              <div key={key} className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                <p className="text-lg font-bold font-mono">{value || '-'}</p>
              </div>
            ))}
          </div>

          {lastUpdate && (
            <p className="text-[10px] text-gray-500">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Berkeley Mono, Berkeley Mono Variable, ui-monospace, monospace' }}
    >
      <div className="container mx-auto">
        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px items-center justify-between">
              <div className="flex -mb-px">
                {(['connection', 'profile', 'mappings', 'monitor', 'data'] as TabType[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors capitalize ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 px-3">
                {/* Connection status indicator */}
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      connectionStatus === 'connected'
                        ? 'bg-green-500'
                        : connectionStatus === 'connecting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-[10px] text-gray-600 capitalize">
                    {connectionStatus}
                  </span>
                </div>

                {/* WebSocket status */}
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      wsStatus === 'connected'
                        ? 'bg-blue-500'
                        : wsStatus === 'connecting'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-[10px] text-gray-500">WS</span>
                </div>
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'connection' && renderConnectionTab()}
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'mappings' && renderMappingsTab()}
            {activeTab === 'monitor' && renderMonitorTab()}
            {activeTab === 'data' && renderDataTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
