import React,{Component} from 'react';
import type {ReactNode} from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class AppErrorBoundary extends Component<{children:ReactNode},{error:Error|null}>{state={error:null};static getDerivedStateFromError(error:Error){return {error}};render(){if(this.state.error)return <main style={{minHeight:'100vh',padding:'32px',background:'#101418',color:'#f5f1e8',fontFamily:'system-ui'}}><h1>D&D Companion could not start</h1><p>The application encountered a runtime error instead of leaving a blank screen.</p><details><summary>Technical detail</summary><pre style={{whiteSpace:'pre-wrap',marginTop:'16px'}}>{this.state.error.message}{this.state.error.stack?`\n\n${this.state.error.stack}`:''}</pre></details></main>;return this.props.children}}

const root=document.getElementById('root');
if(!root) throw new Error('D&D Companion root element was not found.');
createRoot(root).render(<React.StrictMode><AppErrorBoundary><App/></AppErrorBoundary></React.StrictMode>);
