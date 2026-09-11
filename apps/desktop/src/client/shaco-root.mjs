import { Component, createElement as h, useState, useSyncExternalStore } from 'react'
import { Sidebar } from './sidebar.mjs'
import { SettingsOverlay } from './settings.mjs'
import { ShacoChatWorkspace } from './conversation.mjs'

class ShacoErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { window.__SHACO_PRESENTATION__.failClosed('SHACO_PRESENTATION_FAILED') }
  render() { return this.state.failed ? h('div', { role: 'alert' }, 'Shaco Forge 界面暂不可用。') : this.props.children }
}

export function ShacoRoot(props) {
  return h(ShacoErrorBoundary, null, h(ShacoShell, props))
}

function ShacoShell({ ctx, shell }) {
  const state = useSyncExternalStore(shell.subscribe, shell.getSnapshot)
  const chats = useSyncExternalStore(listener => ctx.sessions.list.subscribe(listener), () => ctx.sessions.list.getSnapshot())
  const projects = useSyncExternalStore(listener => ctx.workspaces.list.subscribe(listener), () => ctx.workspaces.list.getSnapshot())
  const [collapsed, setCollapsed] = useState(false)
  const project = projects.items.find(row => row.workspaceId === state.selected)
  const chat = chats.current && chats.byId[chats.current]
  const binding = chats.current && ctx.sessions.binding(chats.current)
  return h('div', { className: 'app-shell', 'data-collapsed': collapsed, 'data-shaco-shell': '', 'data-testid': 'shaco-root' },
    h(Sidebar, { shell, workspaces: ctx.workspaces.list, sessions: ctx.sessions.list, collapsed, toggleSidebar: () => setCollapsed(!collapsed) }),
    h('main', { className: 'workspace' },
      h('header', { className: 'shaco-workbar' },
        h('div', null, h('small', null, project?.title ?? '项目工作空间'), h('h1', null, chat?.displayTitle ?? '新对话')),
        h('output', { className: 'connection-status', 'data-testid': 'connection-status', 'aria-live': 'polite' }, shell.current(shell.token()) ? 'Worker · 已连接' : 'Worker · 正在连接')),
      h('section', { className: 'shaco-chat-workspace', 'data-testid': 'shaco-chat-workspace' },
        chats.current ? h(ShacoChatWorkspace, { ctx, shell, binding }) :
          h('div', { className: 'shaco-empty centered-content' }, h('h2', null, project ? '开始项目对话' : '打开项目，开始工作'), h('p', null, project ? '为当前项目创建新对话。' : '选择本地项目目录，在这里继续你的开发工作。'),
            h('button', { onClick: project ? shell.newChat : shell.openProject, disabled: state.busy }, project ? '新对话' : '打开项目…')))),
    h(SettingsOverlay, { ctx, shell }))
}
