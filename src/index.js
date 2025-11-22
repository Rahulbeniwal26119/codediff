import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      {/* Main routes */}
      <Route path="/" element={<App />} />
      <Route path="/:diffId" element={<App />} />

      {/* SEO-friendly language-specific routes */}
      <Route path="/json-diff" element={<App language="json" />} />
      <Route path="/javascript-diff" element={<App language="javascript" />} />
      <Route path="/python-diff" element={<App language="python" />} />
      <Route path="/java-diff" element={<App language="java" />} />
      <Route path="/php-diff" element={<App language="php" />} />
      <Route path="/ruby-diff" element={<App language="ruby" />} />
      <Route path="/go-diff" element={<App language="go" />} />
      <Route path="/rust-diff" element={<App language="rust" />} />
      <Route path="/typescript-diff" element={<App language="typescript" />} />
      <Route path="/html-diff" element={<App language="html" />} />
      <Route path="/css-diff" element={<App language="css" />} />
      <Route path="/xml-diff" element={<App language="xml" />} />
      <Route path="/yaml-diff" element={<App language="yaml" />} />
      <Route path="/sql-diff" element={<App language="sql" />} />
      <Route path="/shell-diff" element={<App language="shell" />} />
      <Route path="/csharp-diff" element={<App language="csharp" />} />
      <Route path="/cpp-diff" element={<App language="cpp" />} />
      <Route path="/kotlin-diff" element={<App language="kotlin" />} />
      <Route path="/swift-diff" element={<App language="swift" />} />
      <Route path="/dart-diff" element={<App language="dart" />} />
      <Route path="/scala-diff" element={<App language="scala" />} />
      <Route path="/r-diff" element={<App language="r" />} />
      <Route path="/powershell-diff" element={<App language="powershell" />} />
      <Route path="/haskell-diff" element={<App language="haskell" />} />
      <Route path="/objective-c-diff" element={<App language="objective-c" />} />
      <Route path="/clojure-diff" element={<App language="clojure" />} />
      <Route path="/elixir-diff" element={<App language="elixir" />} />
      <Route path="/fsharp-diff" element={<App language="fsharp" />} />
      <Route path="/lua-diff" element={<App language="lua" />} />
      <Route path="/perl-diff" element={<App language="perl" />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

