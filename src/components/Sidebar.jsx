import React, { useState } from 'react';
import { 
  Braces, 
  Binary, 
  ShieldCheck, 
  Container, 
  Code2, 
  FileJson2, 
  ChevronLeft, 
  Terminal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  mobileSidebarActive, 
  setMobileSidebarActive 
}) {
  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({
    json: true,
    encoding: true,
    converters: true,
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const menuGroups = [
    {
      id: 'json',
      label: 'JSON Tools',
      icon: Braces,
      items: [
        { id: 'json-beautifier', label: 'JSON Beautifier', icon: Braces },
        { id: 'json-unescaper', label: 'JSON Unescaper', icon: Binary }
      ]
    },
    {
      id: 'encoding',
      label: 'Security & Encoding',
      icon: ShieldCheck,
      items: [
        { id: 'base64', label: 'Base64 Tool', icon: ShieldCheck },
        { id: 'k8s-secret', label: 'K8s Secret & .env', icon: Container }
      ]
    },
    {
      id: 'converters',
      label: 'Converters',
      icon: Code2,
      items: [
        { id: 'go-converter', label: 'JSON <> Go Struct', icon: Code2 },
        { id: 'ts-converter', label: 'JSON <> TS Type', icon: FileJson2 }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarActive ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-wrapper">
          <Terminal className="logo-icon" />
          <h1 className="sidebar-title">Nabil's tools!</h1>
        </div>
        <button 
          className="collapse-btn" 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle Sidebar"
        >
          <ChevronLeft style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id];
          const hasActiveItem = group.items.some(item => item.id === activeTab);
          
          return (
            <div key={group.id} className={`nav-group ${hasActiveItem ? 'has-active' : ''} ${isExpanded ? 'expanded' : ''}`}>
              {/* Group Header */}
              <button 
                className={`group-header ${hasActiveItem ? 'active' : ''}`}
                onClick={() => {
                  if (sidebarCollapsed) {
                    setSidebarCollapsed(false);
                    setExpandedGroups(prev => ({ ...prev, [group.id]: true }));
                  } else {
                    toggleGroup(group.id);
                  }
                }}
              >
                <div className="group-header-left">
                  <GroupIcon size={20} />
                  <span className="group-label">{group.label}</span>
                </div>
                {!sidebarCollapsed && (
                  <span className="group-arrow">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </button>
              
              {/* Submenu Items */}
              <div className="group-items">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      className={`nav-item submenu-item ${isActive ? 'active' : ''}`}
                      onClick={() => { 
                        setActiveTab(item.id); 
                        setMobileSidebarActive(false); 
                      }}
                    >
                      <ItemIcon size={18} />
                      <span className="nav-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Flyout menu for collapsed state */}
              {sidebarCollapsed && (
                <div className="collapsed-flyout">
                  <div className="flyout-header">{group.label}</div>
                  <div className="flyout-body">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button 
                          key={item.id}
                          className={`flyout-item ${isActive ? 'active' : ''}`}
                          onClick={() => { 
                            setActiveTab(item.id); 
                            setMobileSidebarActive(false); 
                          }}
                        >
                          <ItemIcon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <span className="footer-text">Built for developers</span>
      </div>
    </aside>
  );
}
