// Isolated browser acceptance harness; never imported by the application build.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import {AuthProvider} from '../src/context/AuthContext';
import {TranslationProvider} from '../src/context/TranslationContext';
import Login from '../src/pages/Login';
import Dashboard from '../src/pages/Dashboard';
export function mount(container){const root=createRoot(container);root.render(<BrowserRouter><TranslationProvider><AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/dashboard" element={<Dashboard/>}/></Routes></AuthProvider></TranslationProvider></BrowserRouter>);return root;}
