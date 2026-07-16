import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import JsonBeautifier from './components/JsonBeautifier';
import JsonUnescaper from './components/JsonUnescaper';
import YamlJsonConverter from './components/YamlJsonConverter';
import Base64Tool from './components/Base64Tool';
import K8sSecretTool from './components/K8sSecretTool';
import JwtDecoder from './components/JwtDecoder';
import UrlEncoder from './components/UrlEncoder';
import HashGenerator from './components/HashGenerator';
import HtmlEntityEncoder from './components/HtmlEntityEncoder';
import GoConverter from './components/GoConverter';
import TsConverter from './components/TsConverter';
import TimestampConverter from './components/TimestampConverter';
import UuidGenerator from './components/UuidGenerator';
import RegexTester from './components/RegexTester';

function App() {
  const [activeTab, setActiveTab] = useState('json-beautifier');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    if (!text) {
      triggerToast('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    triggerToast('Copied to clipboard!');
  };

  const pasteFromClipboard = async (setter) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
      triggerToast('Pasted from clipboard!');
    } catch (err) {
      triggerToast('Failed to paste from clipboard');
    }
  };

  // Render active component
  const renderActiveTool = () => {
    switch (activeTab) {
      case 'json-beautifier':
        return <JsonBeautifier copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'json-unescaper':
        return <JsonUnescaper copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'yaml-json':
        return <YamlJsonConverter copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'base64':
        return <Base64Tool copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'k8s-secret':
        return <K8sSecretTool copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'jwt-decoder':
        return <JwtDecoder copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'url-encoder':
        return <UrlEncoder copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'hash-generator':
        return <HashGenerator copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'html-entity':
        return <HtmlEntityEncoder copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'go-converter':
        return <GoConverter copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'ts-converter':
        return <TsConverter copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'timestamp':
        return <TimestampConverter copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      case 'uuid-generator':
        return <UuidGenerator copyToClipboard={copyToClipboard} />;
      case 'regex-tester':
        return <RegexTester copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
      default:
        return <JsonBeautifier copyToClipboard={copyToClipboard} pasteFromClipboard={pasteFromClipboard} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileSidebarActive={mobileSidebarActive}
        setMobileSidebarActive={setMobileSidebarActive}
      />

      {/* Floating Toggle Button for Mobile viewports */}
      <button 
        className="floating-toggle-btn" 
        onClick={() => setMobileSidebarActive(!mobileSidebarActive)}
      >
        <Menu />
      </button>

      {/* Main content panels */}
      <main className="main-content">
        {renderActiveTool()}
      </main>

      {/* Copy feedback toast notification */}
      <div className={`toast ${showToast ? '' : 'hidden'}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
